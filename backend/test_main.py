import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
from models import RicePrice, Lead, RateAuditLog

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
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
        data={"username": "srinivasulu@srinivascanvassing.com", "password": "Manocha"}
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
        "reason": "Test Price Audit Entry"
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
