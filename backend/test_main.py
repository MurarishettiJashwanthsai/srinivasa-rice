import os
import pytest

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-that-is-not-used-in-production")
os.environ.setdefault("ADMIN_USERNAME", "admin@example.test")
os.environ.setdefault("ADMIN_PASSWORD", "test-only-admin-password")
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
from models import RicePrice, Lead, RateAuditLog

from migrate_db import run_migration

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    run_migration()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed test product if empty
        if db.query(RicePrice).count() == 0:
            p = RicePrice(
                variety_name="Test Sona Masuri",
                current_price_mt=850.0,
                previous_price_mt=840.0,
                percentage_change=1.19,
                trend="up"
            )
            db.add(p)
            db.commit()
    finally:
        db.close()
    yield

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_rfq_contact_submission():
    payload = {
        "name": "Test Importer",
        "company": "Global Rice Trade LLC",
        "email": "importer@test.com",
        "whatsapp": "+919876543210",
        "destination_country": "UAE",
        "destination_port": "Jebel Ali",
        "product_name": "Sona Masuri Steam",
        "quantity_mt": 100.0,
        "packaging_type": "50kg PP Bag",
        "incoterm": "FOB",
        "inquiry": "Automated test quote inquiry for export."
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert data["request_id"].startswith("RFQ-2026-")
    assert data["notification_status"] in {"not_configured", "delivered", "failed"}

    db = SessionLocal()
    try:
        saved_lead = db.query(Lead).filter(Lead.request_id == data["request_id"]).one()
        assert saved_lead.notification_status == data["notification_status"]
        assert saved_lead.source_page == "contact"
    finally:
        db.close()

def test_rfq_honeypot_bot_filtering():
    payload = {
        "name": "Spam Bot",
        "company": "Spam Corp",
        "whatsapp": "+1000000000",
        "inquiry": "Buy cheap stuff",
        "honeypot": "I am a spam bot"
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["request_id"] == "RFQ-BOT-FILTERED"

def test_admin_login_and_price_update_audit():
    # Login
    login_resp = client.post(
        "/api/admin/login",
        data={"username": os.environ["ADMIN_USERNAME"], "password": os.environ["ADMIN_PASSWORD"]}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch product to update
    prods = client.get("/api/products").json()
    prod_id = prods[0]["id"]

    # Update Price
    update_payload = {
        "new_price_mt": 890.0,
        "reason": "Test Price Audit Entry",
        "confirm_unusual_rate": True
    }
    update_resp = client.put(f"/api/products/update/{prod_id}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200
    updated_prod = update_resp.json()
    assert updated_prod["current_price_mt"] == 890.0

    # Verify Rate Audit Log
    logs_resp = client.get("/api/rate-audit-logs", headers=headers)
    assert logs_resp.status_code == 200
    logs = logs_resp.json()
    assert len(logs) > 0
    assert logs[0]["action"] == "UPDATE"

def test_product_slug_lookup():
    response = client.get("/api/products/slug/sona-masuri-steam")
    if response.status_code == 200:
        data = response.json()
        assert "variety_name" in data

def test_unusual_rate_warning():
    login_resp = client.post(
        "/api/admin/login",
        data={"username": os.environ["ADMIN_USERNAME"], "password": os.environ["ADMIN_PASSWORD"]}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    prods = client.get("/api/products").json()
    prod_id = prods[0]["id"]
    current_price = prods[0]["current_price_mt"]
    spike_price = current_price * 1.5  # 50% price jump

    # Large price spike without confirm should return 400 Warning
    spike_payload = {
        "new_price_mt": spike_price,
        "reason": "Test Spike Warning",
        "confirm_unusual_rate": False
    }
    spike_resp = client.put(f"/api/products/update/{prod_id}", json=spike_payload, headers=headers)
    assert spike_resp.status_code == 400
    assert "UNUSUAL RATE WARNING" in spike_resp.json()["detail"]

    # Large price spike with confirm_unusual_rate=True should succeed
    confirm_payload = {
        "new_price_mt": spike_price,
        "reason": "Confirmed Test Spike",
        "confirm_unusual_rate": True
    }
    confirm_resp = client.put(f"/api/products/update/{prod_id}", json=confirm_payload, headers=headers)
    assert confirm_resp.status_code == 200
