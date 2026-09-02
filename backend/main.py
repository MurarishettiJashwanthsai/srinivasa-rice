import datetime
import hashlib
import hmac
import io
import os
import re
import secrets
import warnings
import jwt
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form, Request, Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response as FastAPIResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from urllib.parse import urlparse
from xml.sax.saxutils import escape as xml_escape
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
import cloudinary
import cloudinary.uploader
import httpx
from dotenv import load_dotenv
from passlib.hash import pbkdf2_sha256

from database import engine, Base, get_db
from models import RicePrice, Lead, LeadAuditLog, RateAuditLog, AdminSession, AdminLoginHistory

load_dotenv()

CONFIGURED_SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
SECRET_KEY = CONFIGURED_SECRET_KEY or secrets.token_urlsafe(48)
if not CONFIGURED_SECRET_KEY:
    warnings.warn(
        "SECRET_KEY is not configured. Public routes remain available, but admin authentication is disabled.",
        RuntimeWarning,
        stacklevel=1,
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_HOURS = int(os.getenv("ACCESS_TOKEN_HOURS", "8"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "").strip()
ADMIN_PASSWORD_MIN_LENGTH = int(os.getenv("ADMIN_PASSWORD_MIN_LENGTH", "14"))
if ADMIN_PASSWORD and not ADMIN_PASSWORD_HASH:
    warnings.warn(
        "ADMIN_PASSWORD is a legacy migration setting. Configure ADMIN_PASSWORD_HASH and then remove ADMIN_PASSWORD.",
        RuntimeWarning,
        stacklevel=1,
    )
ADMIN_COOKIE_NAME = os.getenv("ADMIN_COOKIE_NAME", "ssc_admin_session").strip() or "ssc_admin_session"
ADMIN_COOKIE_SECURE = os.getenv("ADMIN_COOKIE_SECURE", "true").strip().lower() != "false"
LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "5"))
LOGIN_WINDOW_MINUTES = int(os.getenv("LOGIN_WINDOW_MINUTES", "15"))
LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))
MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(5 * 1024 * 1024)))
SITE_URL = os.getenv("SITE_URL", "https://www.srinivascanvassing.com").rstrip("/")
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY", "").strip()
IS_PRODUCTION = os.getenv("ENVIRONMENT", "").strip().lower() == "production" or os.getenv("RENDER", "").strip().lower() == "true"
TURNSTILE_REQUIRED = os.getenv("TURNSTILE_REQUIRED", "true" if IS_PRODUCTION else "false").strip().lower() == "true"
CONTACT_MAX_SUBMISSIONS = int(os.getenv("CONTACT_MAX_SUBMISSIONS", "5"))
CONTACT_WINDOW_MINUTES = int(os.getenv("CONTACT_WINDOW_MINUTES", "15"))
ALLOW_LOCAL_UPLOADS = os.getenv("ALLOW_LOCAL_UPLOADS", "false" if IS_PRODUCTION else "true").strip().lower() == "true"

ALLOWED_RATE_UNITS = {
    "MT",
    "QUINTAL",
    "KG",
    "SHORT_TON",
    "LONG_TON",
    "BAG_50KG",
    "BAG_25KG",
}


def validate_rate_unit(value: Optional[str]) -> str:
    unit = (value or "MT").strip().upper()
    if unit not in ALLOWED_RATE_UNITS:
        allowed = ", ".join(sorted(ALLOWED_RATE_UNITS))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported quantity unit. Choose one of: {allowed}",
        )
    return unit


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def iso_utc(value: Optional[datetime.datetime] = None) -> str:
    return (value or utc_now()).isoformat()


def admin_configuration_error() -> Optional[str]:
    if not CONFIGURED_SECRET_KEY:
        return "SECRET_KEY must be configured in the Render backend environment"
    if not ADMIN_USERNAME or not (ADMIN_PASSWORD_HASH or ADMIN_PASSWORD):
        return "ADMIN_USERNAME and ADMIN_PASSWORD_HASH must be configured in the Render backend environment"
    if not ADMIN_PASSWORD_HASH and len(ADMIN_PASSWORD) < ADMIN_PASSWORD_MIN_LENGTH:
        return f"ADMIN_PASSWORD must contain at least {ADMIN_PASSWORD_MIN_LENGTH} characters"
    return None


def verify_admin_password(candidate: str) -> bool:
    """Prefer a one-way password hash while retaining an explicit migration path."""
    if ADMIN_PASSWORD_HASH:
        try:
            return pbkdf2_sha256.verify(candidate, ADMIN_PASSWORD_HASH)
        except (TypeError, ValueError):
            return False
    return bool(ADMIN_PASSWORD) and hmac.compare_digest(candidate, ADMIN_PASSWORD)


def client_ip_fingerprint(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    address = forwarded.split(",", 1)[0].strip() if forwarded else ""
    if not address and request.client:
        address = request.client.host
    return hashlib.sha256(f"{SECRET_KEY}:{address or 'unknown'}".encode("utf-8")).hexdigest()[:24]


def safe_user_agent(request: Request) -> str:
    return request.headers.get("user-agent", "unknown")[:300]


def validate_contact_form(form_data: "ContactForm") -> None:
    """Reject malformed or excessively large public form submissions before storage."""
    fields = {
        "Name": (form_data.name, 120),
        "Company name": (form_data.company, 160),
        "Email": (form_data.email, 254),
        "Rice variety": (form_data.product_name, 160),
        "Packaging": (form_data.packaging_type, 100),
        "Requirement details": (form_data.inquiry, 2_000),
        "Source page": (form_data.source_page, 64),
        "Submission reference": (form_data.client_submission_id, 80),
    }
    for label, (value, maximum) in fields.items():
        if value is not None and len(value.strip()) > maximum:
            raise HTTPException(status_code=400, detail=f"{label} must be {maximum} characters or fewer")

    if len(form_data.name.strip()) < 2 or len(form_data.company.strip()) < 2:
        raise HTTPException(status_code=400, detail="Enter a valid name and company name")
    if form_data.email and not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", form_data.email.strip()):
        raise HTTPException(status_code=400, detail="Enter a valid business email address")
    if form_data.quantity_mt is not None and not 0 < form_data.quantity_mt <= 100_000:
        raise HTTPException(status_code=400, detail="Enter a quantity between 1 and 100,000")


def contact_rate_limit_exceeded(db: Session, request: Request) -> bool:
    cutoff = iso_utc(utc_now() - datetime.timedelta(minutes=CONTACT_WINDOW_MINUTES))
    recent_count = db.query(Lead).filter(
        Lead.ip_fingerprint == client_ip_fingerprint(request),
        Lead.created_at >= cutoff,
    ).count()
    return recent_count >= CONTACT_MAX_SUBMISSIONS


def public_product(product: RicePrice) -> dict:
    """Return only fields intended for public website visitors and crawlers."""
    return {
        "id": product.id,
        "variety_name": product.variety_name,
        "slug": product.slug,
        "status": "published",
        "grade": product.grade,
        "current_price_mt": product.current_price_mt,
        "previous_price_mt": product.previous_price_mt,
        "percentage_change": product.percentage_change,
        "trend": product.trend,
        "currency": product.currency,
        "unit": product.unit,
        "price_basis": product.price_basis,
        "market_location": product.market_location,
        "public_note": product.public_note,
        "last_updated": product.last_updated,
        "image_url": product.image_url,
        "moisture": product.moisture,
        "processing": product.processing,
    }


def record_login_event(
    db: Session,
    *,
    username: str,
    outcome: str,
    reason: str,
    request: Request,
) -> None:
    db.add(AdminLoginHistory(
        username=username[:255] or "unknown",
        outcome=outcome,
        reason=reason[:255],
        ip_fingerprint=client_ip_fingerprint(request),
        user_agent=safe_user_agent(request),
        created_at=iso_utc(),
    ))
    db.commit()


def login_is_locked(db: Session, username: str, request: Request) -> bool:
    cutoff = iso_utc(utc_now() - datetime.timedelta(minutes=LOGIN_WINDOW_MINUTES))
    fingerprint = client_ip_fingerprint(request)
    recent_failures = db.query(AdminLoginHistory).filter(
        AdminLoginHistory.outcome == "failure",
        AdminLoginHistory.created_at >= cutoff,
        (AdminLoginHistory.username == username) | (AdminLoginHistory.ip_fingerprint == fingerprint),
    ).order_by(AdminLoginHistory.created_at.desc()).all()
    if len(recent_failures) < LOGIN_MAX_ATTEMPTS:
        return False

    latest_success = db.query(AdminLoginHistory).filter(
        AdminLoginHistory.outcome == "success",
        AdminLoginHistory.username == username,
        AdminLoginHistory.created_at >= cutoff,
    ).first()
    if latest_success is not None:
        return False

    try:
        latest_failure_at = datetime.datetime.fromisoformat(recent_failures[0].created_at)
        if latest_failure_at.tzinfo is None:
            latest_failure_at = latest_failure_at.replace(tzinfo=datetime.timezone.utc)
    except (TypeError, ValueError):
        return True
    return latest_failure_at + datetime.timedelta(minutes=LOGIN_LOCKOUT_MINUTES) > utc_now()


def decode_admin_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate admin session",
        ) from error


# Security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login", auto_error=False)

# Cloudinary is optional for local development; production rejects uploads unless durable storage is configured.
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "").strip()
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "").strip()
CLOUDINARY_ENABLED = all((CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET))

if CLOUDINARY_ENABLED:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )

def slugify(text_val: str) -> str:
    text_val = text_val.lower()
    text_val = re.sub(r'[^a-z0-9]+', '-', text_val)
    return text_val.strip('-')

def init_db():
    from migrate_db import run_migration
    run_migration()
    
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # Never seed or overwrite production inventory. Migrations preserve genuine rows;
        # this compatibility pass only fills a missing slug on an existing product.
        existing = db.query(RicePrice).all()
        updated = False
        for item in existing:
            if not item.slug:
                item.slug = slugify(item.variety_name)
                updated = True
        if updated:
            db.commit()

    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run at startup
    if IS_PRODUCTION and not os.getenv("DATABASE_URL", "").strip():
        raise RuntimeError("DATABASE_URL must be configured in the Render backend environment")
    init_db()
    yield
    # Run at shutdown

app = FastAPI(
    title="Sri Srinivasa Canvassing API",
    lifespan=lifespan,
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

# Configure Static file serving for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS for local React development and Production
origins = [
    "https://www.srinivascanvassing.com", # Production domain
    "https://srinivascanvassing.com",
]
if not IS_PRODUCTION:
    origins.append("http://localhost:5173")

# Add production URL if provided via environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=os.getenv("FRONTEND_URL_REGEX", "").strip() or (None if IS_PRODUCTION else r"https://.*\.srinivascanvassing\.com|https://.*\.vercel\.app|http://localhost:5173"),
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalized_origin(value: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return ""
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}"


ALLOWED_ADMIN_ORIGINS = {normalized_origin(value) for value in origins if normalized_origin(value)}
ADMIN_MUTATION_PREFIXES = (
    "/api/admin/",
    "/api/products/add",
    "/api/products/update/",
    "/api/products/delete/",
    "/api/leads/",
)


def is_admin_mutation_request(request: Request) -> bool:
    if request.method.upper() not in {"POST", "PUT", "PATCH", "DELETE"}:
        return False
    path = request.url.path
    if path.startswith(ADMIN_MUTATION_PREFIXES):
        return True
    return path.startswith("/api/products/") and path.endswith("/image")


@app.middleware("http")
async def apply_api_security_headers(request: Request, call_next):
    if IS_PRODUCTION and is_admin_mutation_request(request):
        request_origin = normalized_origin(request.headers.get("origin", ""))
        if not request_origin or request_origin not in ALLOWED_ADMIN_ORIGINS:
            return FastAPIResponse(
                content='{"detail":"Untrusted administrator request origin"}',
                status_code=status.HTTP_403_FORBIDDEN,
                media_type="application/json",
                headers={"Cache-Control": "no-store"},
            )
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if request.url.path.startswith(("/api/admin", "/api/leads", "/api/contact")):
        response.headers["Cache-Control"] = "no-store"
    return response

# --- Dependencies & Auth ---
async def get_current_session(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminSession:
    if admin_configuration_error():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured securely",
        )

    token = request.cookies.get(ADMIN_COOKIE_NAME) or bearer_token
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin session required")

    payload = decode_admin_token(token)
    username = payload.get("sub")
    session_id = payload.get("jti")
    if not isinstance(username, str) or not isinstance(session_id, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin session")
    if not hmac.compare_digest(username.lower(), ADMIN_USERNAME):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin session")

    session = db.query(AdminSession).filter(AdminSession.session_id == session_id).first()
    if not session or session.revoked_at:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin session has been revoked")

    try:
        expires_at = datetime.datetime.fromisoformat(session.expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
    except (TypeError, ValueError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin session") from error
    if expires_at <= utc_now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin session has expired")

    session.last_seen_at = iso_utc()
    db.commit()
    return session


async def get_current_user(session: AdminSession = Depends(get_current_session)) -> str:
    return session.username

# --- Models ---
class ContactForm(BaseModel):
    name: str
    company: str
    whatsapp: str
    inquiry: str
    email: Optional[str] = None
    destination_country: Optional[str] = None
    destination_port: Optional[str] = None
    product_name: Optional[str] = None
    quantity_mt: Optional[float] = None
    quantity_unit: Optional[str] = "MT"
    packaging_type: Optional[str] = None
    incoterm: Optional[str] = None
    privacy_consent: bool = False
    marketing_consent: bool = False
    turnstile_token: Optional[str] = None
    honeypot: Optional[str] = None # Anti-spam trap field
    source_page: Optional[str] = "contact"
    client_submission_id: Optional[str] = None

class ProductAdd(BaseModel):
    name: str
    initial_price: float
    unit: Optional[str] = "MT"
    moisture: Optional[str] = "12-14% Max"
    processing: Optional[str] = "100% Sortexed"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    new_price_mt: float
    moisture: Optional[str] = None
    processing: Optional[str] = None
    reason: Optional[str] = "Routine Market Update"
    confirm_unusual_rate: Optional[bool] = False
    status: Optional[str] = None
    price_basis: Optional[str] = None
    currency: Optional[str] = None
    unit: Optional[str] = None
    public_note: Optional[str] = None
    internal_note: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    follow_up_at: Optional[str] = None
    internal_notes: Optional[str] = None

# --- Routes ---

@app.post("/api/admin/login")
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    username = form_data.username.strip().lower()
    password = form_data.password

    configuration_error = admin_configuration_error()
    if configuration_error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=configuration_error,
        )

    if login_is_locked(db, username, request):
        record_login_event(
            db,
            username=username,
            outcome="blocked",
            reason="Temporary lockout after repeated failed sign-in attempts",
            request=request,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed sign-in attempts. Try again in {LOGIN_LOCKOUT_MINUTES} minutes.",
            headers={"Retry-After": str(LOGIN_LOCKOUT_MINUTES * 60)},
        )

    credentials_valid = (
        hmac.compare_digest(username, ADMIN_USERNAME)
        and verify_admin_password(password)
    )

    if credentials_valid:
        now = utc_now()
        expires_at = now + datetime.timedelta(hours=ACCESS_TOKEN_HOURS)
        session_id = secrets.token_urlsafe(32)
        access_token = jwt.encode(
            {
                "sub": ADMIN_USERNAME,
                "jti": session_id,
                "iat": now,
                "exp": expires_at,
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        db.add(AdminSession(
            session_id=session_id,
            username=ADMIN_USERNAME,
            issued_at=iso_utc(now),
            expires_at=iso_utc(expires_at),
            last_seen_at=iso_utc(now),
            ip_fingerprint=client_ip_fingerprint(request),
            user_agent=safe_user_agent(request),
        ))
        db.add(AdminLoginHistory(
            username=ADMIN_USERNAME,
            outcome="success",
            reason="Authenticated",
            ip_fingerprint=client_ip_fingerprint(request),
            user_agent=safe_user_agent(request),
            created_at=iso_utc(now),
        ))
        db.commit()
        response.set_cookie(
            key=ADMIN_COOKIE_NAME,
            value=access_token,
            max_age=ACCESS_TOKEN_HOURS * 60 * 60,
            expires=ACCESS_TOKEN_HOURS * 60 * 60,
            path="/",
            secure=ADMIN_COOKIE_SECURE,
            httponly=True,
            samesite="strict",
        )
        response.headers["Cache-Control"] = "no-store"
        return {
            "authenticated": True,
            "username": ADMIN_USERNAME,
            "expires_at": iso_utc(expires_at),
        }

    record_login_event(
        db,
        username=username,
        outcome="failure",
        reason="Incorrect username or password",
        request=request,
    )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.get("/api/admin/session")
async def admin_session_status(session: AdminSession = Depends(get_current_session)):
    return {
        "authenticated": True,
        "username": session.username,
        "expires_at": session.expires_at,
    }


@app.post("/api/admin/logout")
async def logout(
    response: Response,
    session: AdminSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    stored_session = db.query(AdminSession).filter(AdminSession.session_id == session.session_id).first()
    if stored_session:
        stored_session.revoked_at = iso_utc()
    db.commit()
    response.delete_cookie(
        ADMIN_COOKIE_NAME,
        path="/",
        secure=ADMIN_COOKIE_SECURE,
        httponly=True,
        samesite="strict",
    )
    response.headers["Cache-Control"] = "no-store"
    return {"message": "Signed out successfully"}


@app.get("/api/admin/sessions")
async def list_admin_sessions(
    current_session: AdminSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    sessions = db.query(AdminSession).order_by(AdminSession.id.desc()).limit(50).all()
    return [{
        "session_id": item.session_id,
        "username": item.username,
        "issued_at": item.issued_at,
        "expires_at": item.expires_at,
        "last_seen_at": item.last_seen_at,
        "revoked_at": item.revoked_at,
        "ip_fingerprint": item.ip_fingerprint,
        "user_agent": item.user_agent,
        "current": item.session_id == current_session.session_id,
    } for item in sessions]


@app.post("/api/admin/sessions/revoke-all")
async def revoke_all_admin_sessions(
    response: Response,
    _: AdminSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Emergency sign-out for every administrator device, including this one."""
    revoked_at = iso_utc()
    active_sessions = db.query(AdminSession).filter(AdminSession.revoked_at.is_(None)).all()
    for active_session in active_sessions:
        active_session.revoked_at = revoked_at
    db.commit()
    response.delete_cookie(
        ADMIN_COOKIE_NAME,
        path="/",
        secure=ADMIN_COOKIE_SECURE,
        httponly=True,
        samesite="strict",
    )
    response.headers["Cache-Control"] = "no-store"
    return {"message": "All admin sessions revoked", "revoked_count": len(active_sessions)}


@app.post("/api/admin/sessions/{session_id}/revoke")
async def revoke_admin_session(
    session_id: str,
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(AdminSession).filter(AdminSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Admin session not found")
    if not session.revoked_at:
        session.revoked_at = iso_utc()
        db.commit()
    return {"message": "Admin session revoked"}


@app.get("/api/admin/login-history")
async def get_admin_login_history(
    _: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    events = db.query(AdminLoginHistory).order_by(AdminLoginHistory.id.desc()).limit(100).all()
    return events


@app.get("/api/admin/integrations")
async def get_admin_integration_status(_: str = Depends(get_current_user)):
    """Expose configuration readiness to admins without returning secret values."""
    lead_webhook_configured = bool(os.getenv("LEAD_NOTIFICATION_WEBHOOK_URL", "").strip())
    confirmation_webhook_configured = bool(os.getenv("CUSTOMER_CONFIRMATION_WEBHOOK_URL", "").strip())
    cloudinary_configured = all(
        os.getenv(name, "").strip()
        for name in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")
    )
    return {
        "lead_notifications": {
            "configured": lead_webhook_configured,
            "status": "ready" if lead_webhook_configured else "action_required",
        },
        "customer_confirmations": {
            "configured": confirmation_webhook_configured,
            "status": "ready" if confirmation_webhook_configured else "action_required",
        },
        "turnstile": {
            "configured": bool(TURNSTILE_SECRET_KEY),
            "required": TURNSTILE_REQUIRED,
            "status": "ready" if TURNSTILE_SECRET_KEY else "action_required",
        },
        "cloudinary": {
            "configured": cloudinary_configured,
            "status": "ready" if cloudinary_configured else "action_required",
        },
        "admin_password_hash": {
            "configured": bool(ADMIN_PASSWORD_HASH),
            "status": "ready" if ADMIN_PASSWORD_HASH else "action_required",
        },
    }

@app.get("/api/products")
async def get_products(db: Session = Depends(get_db)):
    products = db.query(RicePrice).filter(RicePrice.status == "published").order_by(RicePrice.id.asc()).all()
    return [public_product(product) for product in products]

@app.get("/api/products/slug/{slug}")
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    norm_slug = slug.lower().strip()
    product = db.query(RicePrice).filter(
        RicePrice.slug == norm_slug,
        RicePrice.status == "published",
    ).first()
    if not product:
        all_prods = db.query(RicePrice).filter(RicePrice.status == "published").all()
        for p in all_prods:
            if slugify(p.variety_name) == norm_slug:
                return public_product(p)
        raise HTTPException(status_code=404, detail="Product variety not found")
    return public_product(product)

# Keep /api/prices backward compatibility
@app.get("/api/prices")
async def get_prices(db: Session = Depends(get_db)):
    return await get_products(db)


@app.get("/sitemap.xml", include_in_schema=False)
async def dynamic_sitemap(db: Session = Depends(get_db)):
    public_routes = [
        ("/", "daily", "1.0"),
        ("/about", "monthly", "0.8"),
        ("/products", "daily", "0.9"),
        ("/market-rates", "daily", "0.9"),
        ("/packaging", "monthly", "0.7"),
        ("/certifications", "monthly", "0.7"),
        ("/contact", "monthly", "0.8"),
        ("/legal", "yearly", "0.3"),
    ]
    entries = []
    for path, frequency, priority in public_routes:
        url = f"{SITE_URL}/" if path == "/" else f"{SITE_URL}{path}"
        entries.append(
            f"  <url><loc>{xml_escape(url)}</loc><changefreq>{frequency}</changefreq><priority>{priority}</priority></url>"
        )

    products = db.query(RicePrice).filter(RicePrice.status == "published").order_by(RicePrice.id.asc()).all()
    for product in products:
        product_slug = product.slug or slugify(product.variety_name)
        last_modified = (product.last_updated or "")[:10]
        lastmod_element = f"<lastmod>{xml_escape(last_modified)}</lastmod>" if last_modified else ""
        entries.append(
            f"  <url><loc>{xml_escape(f'{SITE_URL}/products/{product_slug}')}</loc>{lastmod_element}<changefreq>weekly</changefreq><priority>0.8</priority></url>"
        )

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "\n".join(entries)
    xml += "\n</urlset>\n"
    return FastAPIResponse(
        content=xml,
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=300, s-maxage=300"},
    )

def detect_image_extension(content: bytes) -> Optional[str]:
    if content.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "webp"
    if len(content) >= 12 and content[4:8] == b"ftyp" and content[8:12] in {b"avif", b"avis"}:
        return "avif"
    return None


async def validated_image_bytes(image: UploadFile) -> tuple[bytes, str]:
    declared_type = (image.content_type or "").lower()
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/avif"}
    if declared_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG, WebP, or AVIF image",
        )

    await image.seek(0)
    content = await image.read(MAX_IMAGE_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    if len(content) > MAX_IMAGE_BYTES:
        max_megabytes = MAX_IMAGE_BYTES / (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"Image must be {max_megabytes:g} MB or smaller")

    extension = detect_image_extension(content)
    if not extension:
        raise HTTPException(status_code=415, detail="The uploaded file content is not a supported image")
    return content, extension


async def save_image_file(image: UploadFile) -> Optional[str]:
    content, extension = await validated_image_bytes(image)

    # Primary: Upload to Cloudinary
    if CLOUDINARY_ENABLED:
        try:
            upload_result = cloudinary.uploader.upload(
                io.BytesIO(content),
                folder="rice_products",
                resource_type="image",
                format=extension,
            )
            if upload_result and upload_result.get("secure_url"):
                return upload_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload note: {e}")

    if not ALLOW_LOCAL_UPLOADS:
        raise HTTPException(
            status_code=503,
            detail="Image storage is not configured. Please try again later.",
        )

    # Local files are intended only for development. Render files are not durable.
    try:
        os.makedirs("uploads", exist_ok=True)
        filename = f"{secrets.token_hex(16)}.{extension}"
        file_path = os.path.join("uploads", filename)
        with open(file_path, "wb") as f:
            f.write(content)
        return f"/uploads/{filename}"
    except Exception as e:
        print(f"Local file save failed: {e}")
        return None

@app.post("/api/products/add")
async def add_product(
    name: str = Form(...),
    initial_price: float = Form(...),
    unit: str = Form("MT"),
    moisture: str = Form("12-14% Max"),
    processing: str = Form("100% Sortexed"),
    image: Optional[UploadFile] = File(None),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_time = datetime.datetime.now().isoformat()
    image_url = None
    normalized_unit = validate_rate_unit(unit)
    
    if image:
        image_url = await save_image_file(image)

    try:
        new_rice = RicePrice(
            variety_name=name,
            slug=slugify(name),
            current_price_mt=initial_price,
            previous_price_mt=initial_price,
            percentage_change=0.0,
            trend="neutral",
            last_updated=current_time,
            image_url=image_url,
            moisture=moisture,
            processing=processing,
            unit=normalized_unit,
            status="published",
            updated_by=current_user
        )
        db.add(new_rice)
        db.commit()
        db.refresh(new_rice)

        # Record Audit Log
        audit = RateAuditLog(
            rate_id=new_rice.id,
            variety_name=new_rice.variety_name,
            action="CREATE",
            old_price=None,
            new_price=initial_price,
            admin_user=current_user,
            reason="Initial Product Creation",
            timestamp=current_time
        )
        db.add(audit)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Variety already exists")
    
    return new_rice

@app.put("/api/products/update/{id}")
async def update_product(
    id: int, 
    product: ProductUpdate, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    row = db.query(RicePrice).filter(RicePrice.id == id).first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Variety not found")
        
    previous_price = row.current_price_mt
    current_price = product.new_price_mt
    variety_name = product.name if product.name else row.variety_name
    normalized_unit = validate_rate_unit(product.unit) if product.unit is not None else None
    
    if previous_price > 0:
        percentage_change = ((current_price - previous_price) / previous_price) * 100
    else:
        percentage_change = 0.0
        
    if abs(percentage_change) > 20.0 and not product.confirm_unusual_rate:
        raise HTTPException(
            status_code=400,
            detail=f"UNUSUAL RATE WARNING: Price change of {percentage_change:+.2f}% exceeds the 20% variance threshold. Verify currency ({product.currency or row.currency or 'INR'}), unit ({product.unit or row.unit or 'MT'}), and price basis ({product.price_basis or row.price_basis or 'EX_MILL'}) before publishing."
        )

    if current_price > previous_price:
        trend = "up"
    elif current_price < previous_price:
        trend = "down"
    else:
        trend = "neutral"
        
    current_time = datetime.datetime.now().isoformat()
    
    try:
        row.variety_name = variety_name
        row.slug = slugify(variety_name)
        row.current_price_mt = current_price
        row.previous_price_mt = previous_price
        row.percentage_change = round(percentage_change, 2)
        row.trend = trend
        row.last_updated = current_time
        row.updated_by = current_user
        
        if product.moisture is not None:
            row.moisture = product.moisture
        if product.processing is not None:
            row.processing = product.processing
        if product.status is not None:
            row.status = product.status
        if product.price_basis is not None:
            row.price_basis = product.price_basis
        if product.currency is not None:
            row.currency = product.currency
        if normalized_unit is not None:
            row.unit = normalized_unit
        if product.public_note is not None:
            row.public_note = product.public_note
        if product.internal_note is not None:
            row.internal_note = product.internal_note
            
        db.commit()
        db.refresh(row)

        # Audit Log Entry
        audit = RateAuditLog(
            rate_id=row.id,
            variety_name=row.variety_name,
            action="UPDATE",
            old_price=previous_price,
            new_price=current_price,
            admin_user=current_user,
            reason=product.reason or "Price Update",
            timestamp=current_time
        )
        db.add(audit)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Variety name already exists")
    
    return {
        "id": row.id,
        "variety_name": row.variety_name,
        "slug": row.slug,
        "current_price_mt": row.current_price_mt,
        "previous_price_mt": row.previous_price_mt,
        "percentage_change": row.percentage_change,
        "trend": row.trend,
        "last_updated": row.last_updated,
        "moisture": row.moisture,
        "processing": row.processing,
        "unit": row.unit,
        "status": row.status
    }

@app.post("/api/products/{id}/image")
async def upload_product_image(
    id: int,
    image: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    row = db.query(RicePrice).filter(RicePrice.id == id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Variety not found")

    image_url = await save_image_file(image)
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to save image")

    row.image_url = image_url
    row.last_updated = datetime.datetime.now().isoformat()
    db.commit()
    db.refresh(row)
    return row

@app.delete("/api/products/delete/{id}")
async def delete_product(
    id: int, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    row = db.query(RicePrice).filter(RicePrice.id == id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Variety not found")
        
    current_time = datetime.datetime.now().isoformat()
    audit = RateAuditLog(
        rate_id=row.id,
        variety_name=row.variety_name,
        action="ARCHIVE",
        old_price=row.current_price_mt,
        new_price=0.0,
        admin_user=current_user,
        reason="Product Soft Archived",
        timestamp=current_time
    )
    db.add(audit)

    # Soft archive instead of hard drop
    row.status = "archived"
    db.commit()
    return {"message": "Variety soft archived successfully"}


async def verify_turnstile(token: Optional[str], request: Request) -> None:
    if not TURNSTILE_SECRET_KEY:
        if TURNSTILE_REQUIRED:
            raise HTTPException(
                status_code=503,
                detail="Anti-spam verification is not configured. Please contact us by WhatsApp.",
            )
        return
    if not token:
        raise HTTPException(status_code=400, detail="Please complete the anti-spam verification")

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            result = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={
                    "secret": TURNSTILE_SECRET_KEY,
                    "response": token,
                    "remoteip": request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip(),
                },
            )
            result.raise_for_status()
            verification = result.json()
    except Exception as error:
        raise HTTPException(status_code=503, detail="Anti-spam verification is temporarily unavailable") from error

    if not verification.get("success"):
        raise HTTPException(status_code=400, detail="Anti-spam verification failed. Please try again")

    expected_hostname = urlparse(SITE_URL).hostname
    if expected_hostname and verification.get("hostname") != expected_hostname:
        raise HTTPException(status_code=400, detail="Anti-spam verification came from an unauthorized hostname")


@app.post("/api/contact")
async def handle_contact(
    form_data: ContactForm,
    request: Request,
    db: Session = Depends(get_db),
):
    # Anti-spam Honeypot Check
    if form_data.honeypot and len(form_data.honeypot.strip()) > 0:
        # Silent rejection for bot submissions
        return {
            "message": "Inquiry received successfully.",
            "request_id": "RFQ-BOT-FILTERED",
            "notification_status": "filtered"
        }

    if not form_data.privacy_consent:
        raise HTTPException(status_code=400, detail="Privacy consent is required to submit an enquiry")

    validate_contact_form(form_data)

    if contact_rate_limit_exceeded(db, request):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many enquiries were submitted from this connection. Please wait a few minutes or contact us by WhatsApp.",
            headers={"Retry-After": str(CONTACT_WINDOW_MINUTES * 60)},
        )

    client_submission_id = (form_data.client_submission_id or "").strip()
    if client_submission_id:
        existing_lead = db.query(Lead).filter(Lead.client_submission_id == client_submission_id).first()
        if existing_lead:
            return {
                "message": "Inquiry already received successfully.",
                "request_id": existing_lead.request_id,
                "notification_status": existing_lead.notification_status,
                "confirmation_status": existing_lead.confirmation_status,
            }

    normalized_whatsapp = form_data.whatsapp.strip().replace(" ", "").replace("-", "")
    if not re.fullmatch(r"\+?[1-9]\d{6,14}", normalized_whatsapp):
        raise HTTPException(status_code=400, detail="Enter a valid WhatsApp number including country code")

    quantity_unit = validate_rate_unit(form_data.quantity_unit)
    await verify_turnstile(form_data.turnstile_token, request)

    request_id = f"RFQ-{datetime.datetime.now().year}-{secrets.token_hex(3).upper()}"
    try:
        allowed_sources = {"contact", "price-alert", "mobile-app"}
        source_page = form_data.source_page if form_data.source_page in allowed_sources else "contact"
        new_lead = Lead(
            request_id=request_id,
            name=form_data.name.strip(),
            company=form_data.company.strip(),
            email=form_data.email.strip() if form_data.email else None,
            whatsapp=normalized_whatsapp,
            destination_country=form_data.destination_country,
            destination_port=form_data.destination_port,
            product_name=form_data.product_name,
            quantity_mt=form_data.quantity_mt,
            quantity_unit=quantity_unit,
            packaging_type=form_data.packaging_type,
            incoterm=form_data.incoterm,
            inquiry_text=form_data.inquiry.strip(),
            status="new",
            source_page=source_page,
            notification_status="pending",
            notification_channel="webhook",
            privacy_consent=True,
            marketing_consent=form_data.marketing_consent,
            consent_at=iso_utc(),
            confirmation_status="pending",
            confirmation_channel="none",
            client_submission_id=client_submission_id or None,
            ip_fingerprint=client_ip_fingerprint(request),
            created_at=datetime.datetime.now().isoformat()
        )
        db.add(new_lead)
        db.commit()

        webhook_url = os.getenv("LEAD_NOTIFICATION_WEBHOOK_URL", "").strip()
        if not webhook_url:
            new_lead.notification_status = "not_configured"
            new_lead.notification_channel = "none"
        else:
            new_lead.notification_attempted_at = datetime.datetime.now().isoformat()
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    notification_response = await client.post(
                        webhook_url,
                        json={
                            "event": "new_lead",
                            "request_id": request_id,
                            "source_page": source_page,
                            "name": new_lead.name,
                            "company": new_lead.company,
                            "email": new_lead.email,
                            "whatsapp": new_lead.whatsapp,
                            "product_name": new_lead.product_name,
                            "quantity_mt": new_lead.quantity_mt,
                            "quantity_unit": new_lead.quantity_unit,
                            "marketing_consent": new_lead.marketing_consent,
                            "created_at": new_lead.created_at,
                        },
                    )
                    notification_response.raise_for_status()
                new_lead.notification_status = "delivered"
                new_lead.notification_delivered_at = datetime.datetime.now().isoformat()
                new_lead.notification_error = None
            except Exception as notification_error:
                new_lead.notification_status = "failed"
                new_lead.notification_error = str(notification_error)[:500]

        confirmation_webhook_url = os.getenv("CUSTOMER_CONFIRMATION_WEBHOOK_URL", "").strip()
        if not confirmation_webhook_url:
            new_lead.confirmation_status = "not_configured"
            new_lead.confirmation_channel = "none"
        else:
            new_lead.confirmation_attempted_at = iso_utc()
            new_lead.confirmation_channel = "webhook"
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    confirmation_response = await client.post(
                        confirmation_webhook_url,
                        json={
                            "event": "quote_reference_confirmation",
                            "request_id": request_id,
                            "name": new_lead.name,
                            "email": new_lead.email,
                            "whatsapp": new_lead.whatsapp,
                            "product_name": new_lead.product_name,
                            "quantity": new_lead.quantity_mt,
                            "quantity_unit": new_lead.quantity_unit,
                            "message": f"Your Sri Srinivasa Canvassing enquiry reference is {request_id}.",
                        },
                    )
                    confirmation_response.raise_for_status()
                new_lead.confirmation_status = "delivered"
                new_lead.confirmation_delivered_at = iso_utc()
                new_lead.confirmation_error = None
            except Exception as confirmation_error:
                new_lead.confirmation_status = "failed"
                new_lead.confirmation_error = str(confirmation_error)[:500]

        db.commit()
        return {
            "message": "Inquiry received successfully. Our team will contact you shortly via WhatsApp.",
            "request_id": request_id,
            "notification_status": new_lead.notification_status,
            "confirmation_status": new_lead.confirmation_status,
        }
    except IntegrityError as error:
        db.rollback()
        if client_submission_id:
            existing_lead = db.query(Lead).filter(Lead.client_submission_id == client_submission_id).first()
            if existing_lead:
                return {
                    "message": "Inquiry already received successfully.",
                    "request_id": existing_lead.request_id,
                    "notification_status": existing_lead.notification_status,
                    "confirmation_status": existing_lead.confirmation_status,
                }
        print(f"Lead integrity check failed: {error}")
        raise HTTPException(status_code=409, detail="This enquiry was already received. Please refresh and check your reference.") from error
    except Exception as e:
        db.rollback()
        print(f"Failed to save lead: {e}")
        raise HTTPException(status_code=500, detail="Failed to process quote request")

@app.get("/api/leads")
async def get_leads(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    leads = db.query(Lead).order_by(Lead.id.desc()).all()
    # Preserve and return every genuine record. No demo identifiers are filtered here.
    return leads


@app.patch("/api/leads/{lead_id}")
async def update_lead(
    lead_id: int,
    update: LeadUpdate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    old_status = lead.status
    changed_fields = []
    if update.status is not None:
        normalized_status = update.status.strip().lower()
        allowed_statuses = {"new", "contacted", "qualified", "quoted", "won", "closed"}
        if normalized_status not in allowed_statuses:
            raise HTTPException(status_code=400, detail="Unsupported inquiry status")
        if normalized_status != lead.status:
            lead.status = normalized_status
            changed_fields.append("status")

    if update.follow_up_at is not None:
        follow_up_at = update.follow_up_at.strip() or None
        if follow_up_at and len(follow_up_at) > 40:
            raise HTTPException(status_code=400, detail="Follow-up date is invalid")
        if follow_up_at != lead.follow_up_at:
            lead.follow_up_at = follow_up_at
            changed_fields.append("follow_up_at")

    if update.internal_notes is not None:
        notes = update.internal_notes.strip() or None
        if notes and len(notes) > 2_000:
            raise HTTPException(status_code=400, detail="Internal notes must be 2,000 characters or fewer")
        if notes != lead.internal_notes:
            lead.internal_notes = notes
            changed_fields.append("internal_notes")

    if not changed_fields:
        return lead

    changed_at = iso_utc()
    lead.updated_at = changed_at
    lead.updated_by = current_user
    db.add(LeadAuditLog(
        lead_id=lead.id,
        action="UPDATE",
        old_status=old_status,
        new_status=lead.status,
        admin_user=current_user,
        details=",".join(changed_fields),
        timestamp=changed_at,
    ))
    db.commit()
    db.refresh(lead)
    return lead


@app.get("/api/rate-audit-logs")
async def get_rate_audit_logs(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(RateAuditLog).order_by(RateAuditLog.id.desc()).all()
    return logs

@app.get("/")
async def root():
    return {"message": "Sri Srinivasa Canvassing B2B API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
