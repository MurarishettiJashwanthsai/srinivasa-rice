import datetime
import os
import jwt
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
import cloudinary
import cloudinary.uploader
import httpx

from database import engine, Base, get_db
from models import RicePrice, Lead

SECRET_KEY = os.getenv("SECRET_KEY", "ss_canvassing_secure_jwt_secret_2026")
ALGORITHM = "HS256"

# Security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

# Cloudinary Configuration
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "df948lfrf"), 
    api_key = os.getenv("CLOUDINARY_API_KEY", "748133643683359"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "qocSWo8jUw6vCa36QRs7vsRCVtk"),
    secure = True
)

import re

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
        try:
            rice_count = db.query(RicePrice).count()
        except Exception:
            db.rollback()
            rice_count = 0

        seed_data = [
            ("Sona Masuri Steam(BPT)", 5500.0, 5450.0, 0.92, "up"),
            ("Sona Masuri Raw(BPT)", 5600.0, 5550.0, 0.90, "up"),
            ("lachikari raw rice(JSR)", 7900.0, 7850.0, 0.64, "up"),
            ("RNR Steam", 5950.0, 5900.0, 0.85, "up"),
            ("Jsr Steem Rice", 6470.0, 6400.0, 1.09, "up"),
        ]
        
        current_time = datetime.datetime.now().isoformat()
        existing_products = {p.variety_name: p for p in db.query(RicePrice).all()}
        
        db_changed = False
        # Preserve all existing products; seed data only adds missing rows or refreshes matching rows.
        for item in seed_data:
            name, curr_price, prev_price, change, trend = item
            if name in existing_products:
                prod = existing_products[name]
                if prod.current_price_mt != curr_price:
                    prod.current_price_mt = curr_price
                    prod.previous_price_mt = prev_price
                    prod.percentage_change = change
                    prod.trend = trend
                    prod.last_updated = current_time
                    db_changed = True
            else:
                new_rice = RicePrice(
                    variety_name=name,
                    slug=slugify(name),
                    current_price_mt=curr_price,
                    previous_price_mt=prev_price,
                    percentage_change=change,
                    trend=trend,
                    last_updated=current_time,
                    status="published"
                )
                db.add(new_rice)
                db_changed = True
                
        if db_changed:
            db.commit()

        # Ensure all existing products have a slug
        existing = db.query(RicePrice).all()
        updated = False
        for item in existing:
            if not item.slug:
                item.slug = slugify(item.variety_name)
                updated = True
        if updated:
            db.commit()

        try:
            lead_count = db.query(Lead).count()
        except Exception:
            db.rollback()
            lead_count = 0

        if lead_count == 0:
            current_time = datetime.datetime.now().isoformat()
            seed_leads = [
                Lead(
                    request_id="RFQ-2026-A1B2",
                    name="Rajesh Kumar",
                    company="Sri Laxmi Traders",
                    email="rajesh@srilaxmitraders.com",
                    whatsapp="+919866760028",
                    destination_country="India",
                    destination_port="Chennai Port",
                    product_name="Sona Masuri Steam",
                    quantity_mt=50.0,
                    packaging_type="50kg PP Bag",
                    incoterm="FOB",
                    inquiry_text="Interested in 50 MT Sona Masuri Steam rice export quality. Please share latest FOB price quote.",
                    status="contacted",
                    source_page="contact",
                    created_at=current_time
                ),
                Lead(
                    request_id="RFQ-2026-C3D4",
                    name="Ahmed Al-Mansoor",
                    company="Al-Khaleej Foodstuffs LLC",
                    email="ahmed@alkhaleejfood.ae",
                    whatsapp="+919866760028",
                    destination_country="UAE",
                    destination_port="Jebel Ali Port",
                    product_name="1121 Basmati Sella",
                    quantity_mt=100.0,
                    packaging_type="50kg PP Bag",
                    incoterm="CIF",
                    inquiry_text="Looking for regular supply of 1121 Basmati Sella 50kg PP bags to Jebel Ali. Need CIF Dubai rate.",
                    status="in_progress",
                    source_page="contact",
                    created_at=current_time
                ),
                Lead(
                    request_id="RFQ-2026-E5F6",
                    name="Venkatesh Rao",
                    company="Rao Global Impex",
                    email="vrao@raoglobalimpex.com",
                    whatsapp="+919866760028",
                    destination_country="India",
                    destination_port="Visakhapatnam Port",
                    product_name="IR64 5% Broken",
                    quantity_mt=200.0,
                    packaging_type="50kg PP Bag",
                    incoterm="FOB",
                    inquiry_text="Require 200 MT IR64 5% Broken Non-Basmati Rice for immediate shipment. Please send specifications.",
                    status="new",
                    source_page="contact",
                    created_at=current_time
                ),
                Lead(
                    request_id="RFQ-2026-G7H8",
                    name="Karthik Sharma",
                    company="South Asia Grain Corp",
                    email="karthik@southasiagrain.com",
                    whatsapp="+919866760028",
                    destination_country="Singapore",
                    destination_port="Jurong Port",
                    product_name="Sona Masuri Raw",
                    quantity_mt=25.0,
                    packaging_type="25kg Non-Woven Bag",
                    incoterm="CIF",
                    inquiry_text="Requesting price quote and moisture report for Sona Masuri Raw 25kg non-woven bag packaging.",
                    status="new",
                    source_page="contact",
                    created_at=current_time
                ),
            ]
            for lead in seed_leads:
                db.add(lead)
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run at startup
    init_db()
    yield
    # Run at shutdown

app = FastAPI(title="Sri Srinivasa Canvassing API", lifespan=lifespan)

# Configure Static file serving for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS for local React development and Production
origins = [
    "http://localhost:5173", # Local dev default
    "https://www.srinivascanvassing.com", # Production domain
    "https://srinivascanvassing.com",
]

# Add production URL if provided via environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=os.getenv("FRONTEND_URL_REGEX", r"https://.*\.srinivascanvassing\.com|https://.*\.vercel\.app|http://localhost:5173"),
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependencies & Auth ---
async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        expected_user = os.getenv("ADMIN_USERNAME", "srinivasulu@srinivascanvassing.com").lower()
        if not username or not isinstance(username, str) or username.lower() != expected_user:
            raise credentials_exception
        return username
    except jwt.PyJWTError:
        raise credentials_exception

import secrets
from models import RateAuditLog

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
    packaging_type: Optional[str] = None
    incoterm: Optional[str] = None
    honeypot: Optional[str] = None # Anti-spam trap field
    source_page: Optional[str] = "contact"

class ProductAdd(BaseModel):
    name: str
    initial_price: float
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

# --- Routes ---

@app.post("/api/admin/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username.strip().lower()
    password = form_data.password.strip()
    
    expected_user = os.getenv("ADMIN_USERNAME", "srinivasulu@srinivascanvassing.com").lower()
    expected_pass = os.getenv("ADMIN_PASSWORD", "Manocha")
    
    if username == expected_user and password == expected_pass:
        access_token = jwt.encode({"sub": expected_user}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/api/products")
async def get_products(db: Session = Depends(get_db)):
    """Alias for getting all products"""
    products = db.query(RicePrice).order_by(RicePrice.id.asc()).all()
    return products

@app.get("/api/products/slug/{slug}")
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    norm_slug = slug.lower().strip()
    product = db.query(RicePrice).filter(RicePrice.slug == norm_slug).first()
    if not product:
        all_prods = db.query(RicePrice).all()
        for p in all_prods:
            if slugify(p.variety_name) == norm_slug:
                return p
        raise HTTPException(status_code=404, detail="Product variety not found")
    return product

# Keep /api/prices backward compatibility
@app.get("/api/prices")
async def get_prices(db: Session = Depends(get_db)):
    return await get_products(db)

async def save_image_file(image: UploadFile) -> Optional[str]:
    # Primary: Upload to Cloudinary
    try:
        image.file.seek(0)
        upload_result = cloudinary.uploader.upload(image.file, folder="rice_products")
        if upload_result and upload_result.get("secure_url"):
            return upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload note: {e}")

    # Fallback: Save to local uploads directory
    try:
        os.makedirs("uploads", exist_ok=True)
        filename = f"{secrets.token_hex(6)}_{image.filename}"
        file_path = os.path.join("uploads", filename)
        image.file.seek(0)
        content = await image.read()
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
    moisture: str = Form("12-14% Max"),
    processing: str = Form("100% Sortexed"),
    image: Optional[UploadFile] = File(None),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_time = datetime.datetime.now().isoformat()
    image_url = None
    
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
        if product.unit is not None:
            row.unit = product.unit
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

@app.post("/api/contact")
async def handle_contact(form_data: ContactForm, db: Session = Depends(get_db)):
    # Anti-spam Honeypot Check
    if form_data.honeypot and len(form_data.honeypot.strip()) > 0:
        # Silent rejection for bot submissions
        return {
            "message": "Inquiry received successfully.",
            "request_id": "RFQ-BOT-FILTERED",
            "notification_status": "filtered"
        }

    request_id = f"RFQ-{datetime.datetime.now().year}-{secrets.token_hex(3).upper()}"
    try:
        allowed_sources = {"contact", "price-alert"}
        source_page = form_data.source_page if form_data.source_page in allowed_sources else "contact"
        new_lead = Lead(
            request_id=request_id,
            name=form_data.name.strip(),
            company=form_data.company.strip(),
            email=form_data.email.strip() if form_data.email else None,
            whatsapp=form_data.whatsapp.strip(),
            destination_country=form_data.destination_country,
            destination_port=form_data.destination_port,
            product_name=form_data.product_name,
            quantity_mt=form_data.quantity_mt,
            packaging_type=form_data.packaging_type,
            incoterm=form_data.incoterm,
            inquiry_text=form_data.inquiry.strip(),
            status="new",
            source_page=source_page,
            notification_status="pending",
            notification_channel="webhook",
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

        db.commit()
        return {
            "message": "Inquiry received successfully. Our team will contact you shortly via WhatsApp.",
            "request_id": request_id,
            "notification_status": new_lead.notification_status
        }
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
    return leads

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
