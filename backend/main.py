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

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Migrate DB to add new columns if they don't exist
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        try:
            db.execute(text("ALTER TABLE rice_prices ADD COLUMN moisture VARCHAR DEFAULT '12-14% Max'"))
            db.commit()
        except Exception:
            db.rollback()
            
        try:
            db.execute(text("ALTER TABLE rice_prices ADD COLUMN processing VARCHAR DEFAULT '100% Sortexed'"))
            db.commit()
        except Exception:
            db.rollback()

        if db.query(RicePrice).count() == 0:
            seed_data = [
                ("Sona Masuri Steam", 850.0, 840.0, 1.19, "up"),
                ("Sona Masuri Raw", 830.0, 830.0, 0.0, "neutral"),
                ("Sona Masuri Parboiled", 800.0, 810.0, -1.23, "down"),
                ("Swarna", 650.0, 645.0, 0.78, "up"),
                ("IR64 5% Broken", 550.0, 560.0, -1.79, "down"),
                ("IR64 25% Broken", 510.0, 510.0, 0.0, "neutral"),
                ("BPT 5204", 720.0, 715.0, 0.70, "up"),
                ("1121 Basmati Sella", 1200.0, 1180.0, 1.69, "up"),
                ("1121 Basmati Steam", 1250.0, 1260.0, -0.79, "down"),
                ("1509 Basmati", 1100.0, 1100.0, 0.0, "neutral"),
            ]
            
            current_time = datetime.datetime.now().isoformat()
            
            for item in seed_data:
                new_rice = RicePrice(
                    variety_name=item[0],
                    current_price_mt=item[1],
                    previous_price_mt=item[2],
                    percentage_change=item[3],
                    trend=item[4],
                    last_updated=current_time
                )
                db.add(new_rice)
                
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
        if not username or not isinstance(username, str) or username != "srinivasulu@srinivascanvassing.com":
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

# Keep /api/prices backward compatibility
@app.get("/api/prices")
async def get_prices(db: Session = Depends(get_db)):
    return await get_products(db)

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
        try:
            upload_result = cloudinary.uploader.upload(image.file, folder="rice_products")
            image_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload failed: {e}")
            image_url = None

    try:
        new_rice = RicePrice(
            variety_name=name,
            current_price_mt=initial_price,
            previous_price_mt=initial_price,
            percentage_change=0.0,
            trend="neutral",
            last_updated=current_time,
            image_url=image_url,
            moisture=moisture,
            processing=processing,
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
        
    if current_price > previous_price:
        trend = "up"
    elif current_price < previous_price:
        trend = "down"
    else:
        trend = "neutral"
        
    current_time = datetime.datetime.now().isoformat()
    
    try:
        row.variety_name = variety_name
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
        "current_price_mt": row.current_price_mt,
        "previous_price_mt": row.previous_price_mt,
        "percentage_change": row.percentage_change,
        "trend": row.trend,
        "last_updated": row.last_updated,
        "moisture": row.moisture,
        "processing": row.processing
    }

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
        action="DELETE",
        old_price=row.current_price_mt,
        new_price=0.0,
        admin_user=current_user,
        reason="Product Deleted",
        timestamp=current_time
    )
    db.add(audit)

    db.delete(row)
    db.commit()
    return {"message": "Variety deleted successfully"}

@app.post("/api/contact")
async def handle_contact(form_data: ContactForm, db: Session = Depends(get_db)):
    # Anti-spam Honeypot Check
    if form_data.honeypot and len(form_data.honeypot.strip()) > 0:
        # Silent rejection for bot submissions
        return {"message": "Inquiry received successfully.", "request_id": "RFQ-BOT-FILTERED"}

    request_id = f"RFQ-2026-{secrets.token_hex(3).upper()}"
    try:
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
            source_page="contact",
            created_at=datetime.datetime.now().isoformat()
        )
        db.add(new_lead)
        db.commit()
        return {
            "message": "Inquiry received successfully. Our team will contact you shortly via WhatsApp.",
            "request_id": request_id
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

