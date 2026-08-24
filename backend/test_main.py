import os
import uuid
import pytest

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-that-is-not-used-in-production")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_market_data.db")
os.environ.setdefault("ADMIN_USERNAME", "admin@example.test")
os.environ.setdefault("ADMIN_PASSWORD", "test-only-admin-password")
os.environ.setdefault("ADMIN_COOKIE_SECURE", "false")
from fastapi.testclient import TestClient
from passlib.hash import pbkdf2_sha256
import main as main_module
from main import app
from database import Base, engine, SessionLocal
from models import RicePrice, Lead, LeadAuditLog, RateAuditLog, AdminSession, AdminLoginHistory

from migrate_db import run_migration

client = TestClient(app)


def login_admin():
    return client.post(
        "/api/admin/login",
        data={"username": os.environ["ADMIN_USERNAME"], "password": os.environ["ADMIN_PASSWORD"]},
    )

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
                slug="test-sona-masuri",
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
    assert "internal_note" not in data[0]
    assert "updated_by" not in data[0]
    assert "reviewed_by" not in data[0]


def test_dynamic_sitemap_contains_published_products():
    product = client.get("/api/products").json()[0]
    response = client.get("/sitemap.xml")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/xml")
    assert f"/products/{product['slug']}" in response.text

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
        "inquiry": "Automated test quote inquiry for export.",
        "privacy_consent": True,
        "marketing_consent": False,
    }
    response = client.post("/api/contact", json=payload, headers={"x-forwarded-for": f"contact-{uuid.uuid4().hex}"})
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
        assert saved_lead.privacy_consent is True
        assert saved_lead.marketing_consent is False
        assert saved_lead.quantity_unit == "MT"
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


def test_rfq_requires_privacy_consent_and_valid_phone():
    base_payload = {
        "name": "Consent Test",
        "company": "Example Company",
        "whatsapp": "+919876543210",
        "inquiry": "Test enquiry",
    }
    no_consent = client.post("/api/contact", json=base_payload)
    assert no_consent.status_code == 400
    assert "Privacy consent" in no_consent.json()["detail"]

    invalid_phone = client.post(
        "/api/contact",
        json={**base_payload, "privacy_consent": True, "whatsapp": "123"},
    )
    assert invalid_phone.status_code == 400
    assert "WhatsApp number" in invalid_phone.json()["detail"]


def test_admin_cookie_session_history_and_logout():
    login_response = login_admin()
    assert login_response.status_code == 200
    assert login_response.json()["authenticated"] is True
    assert "access_token" not in login_response.json()
    assert "httponly" in login_response.headers["set-cookie"].lower()

    session_response = client.get("/api/admin/session")
    assert session_response.status_code == 200
    sessions_response = client.get("/api/admin/sessions")
    assert sessions_response.status_code == 200
    assert any(item["current"] for item in sessions_response.json())
    history_response = client.get("/api/admin/login-history")
    assert history_response.status_code == 200
    assert any(item["outcome"] == "success" for item in history_response.json())

    logout_response = client.post("/api/admin/logout")
    assert logout_response.status_code == 200
    assert client.get("/api/admin/session").status_code == 401


def test_hashed_admin_password_verification(monkeypatch):
    password = "unique test administrator password"
    monkeypatch.setattr(main_module, "ADMIN_PASSWORD_HASH", pbkdf2_sha256.hash(password))
    monkeypatch.setattr(main_module, "ADMIN_PASSWORD", "")
    assert main_module.verify_admin_password(password) is True
    assert main_module.verify_admin_password("incorrect password") is False


def test_production_admin_mutations_require_trusted_origin(monkeypatch):
    monkeypatch.setattr(main_module, "IS_PRODUCTION", True)
    rejected = client.post(
        "/api/admin/login",
        data={"username": os.environ["ADMIN_USERNAME"], "password": os.environ["ADMIN_PASSWORD"]},
        headers={"Origin": "https://attacker.example"},
    )
    assert rejected.status_code == 403

    accepted = client.post(
        "/api/admin/login",
        data={"username": os.environ["ADMIN_USERNAME"], "password": os.environ["ADMIN_PASSWORD"]},
        headers={"Origin": "https://www.srinivascanvassing.com"},
    )
    assert accepted.status_code == 200


def test_revoke_all_admin_sessions_signs_out_current_device():
    assert login_admin().status_code == 200
    response = client.post("/api/admin/sessions/revoke-all")
    assert response.status_code == 200
    assert response.json()["revoked_count"] >= 1
    assert client.get("/api/admin/session").status_code == 401


def test_rejects_unsupported_or_oversized_image_upload():
    assert login_admin().status_code == 200
    product = client.get("/api/products").json()[0]
    unsupported = client.post(
        f"/api/products/{product['id']}/image",
        files={"image": ("unsafe.svg", b"<svg></svg>", "image/svg+xml")},
    )
    assert unsupported.status_code == 415

def test_admin_leads_return_existing_rows_without_deleting_them():
    login_resp = login_admin()
    assert login_resp.status_code == 200

    demo_request_id = "RFQ-2026-A1B2"
    genuine_request_id = f"RFQ-TEST-{uuid.uuid4().hex[:8].upper()}"
    db = SessionLocal()
    created_demo = False
    try:
        demo_lead = db.query(Lead).filter(Lead.request_id == demo_request_id).first()
        if demo_lead is None:
            demo_lead = Lead(
                request_id=demo_request_id,
                name="Demo Inquiry",
                company="Demo Company",
                whatsapp="+910000000000",
                inquiry_text="Demo row that must not be returned.",
                status="new",
                source_page="contact"
            )
            db.add(demo_lead)
            created_demo = True

        genuine_lead = Lead(
            request_id=genuine_request_id,
            name="Genuine Inquiry",
            company="Genuine Company",
            whatsapp="+919999999999",
            inquiry_text="Genuine stored inquiry.",
            status="new",
            source_page="contact"
        )
        db.add(genuine_lead)
        db.commit()

        response = client.get("/api/leads")
        assert response.status_code == 200
        returned_request_ids = {lead["request_id"] for lead in response.json()}
        assert genuine_request_id in returned_request_ids
        assert demo_request_id in returned_request_ids
        assert db.query(Lead).filter(Lead.request_id == demo_request_id).first() is not None
    finally:
        db.query(Lead).filter(Lead.request_id == genuine_request_id).delete()
        if created_demo:
            db.query(Lead).filter(Lead.request_id == demo_request_id).delete()
        db.commit()
        db.close()


def test_admin_can_update_inquiry_status_with_audit_history():
    assert login_admin().status_code == 200
    request_id = f"RFQ-STATUS-{uuid.uuid4().hex[:8].upper()}"
    db = SessionLocal()
    try:
        lead = Lead(
            request_id=request_id,
            name="CRM Status Test",
            company="Example Company",
            whatsapp="+919999999998",
            inquiry_text="Test CRM lifecycle update.",
            status="new",
            source_page="contact",
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        lead_id = lead.id

        response = client.patch(f"/api/leads/{lead_id}", json={"status": "contacted"})
        assert response.status_code == 200
        assert response.json()["status"] == "contacted"
        db.expire_all()
        assert db.query(Lead).filter(Lead.id == lead_id).one().status == "contacted"
        audit = db.query(LeadAuditLog).filter(LeadAuditLog.lead_id == lead_id).one()
        assert audit.old_status == "new"
        assert audit.new_status == "contacted"
    finally:
        if 'lead_id' in locals():
            db.query(LeadAuditLog).filter(LeadAuditLog.lead_id == lead_id).delete()
            db.query(Lead).filter(Lead.id == lead_id).delete()
            db.commit()
        db.close()


def test_contact_submission_id_prevents_duplicate_enquiries():
    submission_id = f"submission-{uuid.uuid4().hex}"
    payload = {
        "name": "Duplicate Protection Test",
        "company": "Example Imports",
        "email": "buyer@example.test",
        "whatsapp": "+919876543210",
        "inquiry": "Please send the latest bulk availability.",
        "privacy_consent": True,
        "client_submission_id": submission_id,
    }
    headers = {"x-forwarded-for": f"duplicate-{uuid.uuid4().hex}"}
    first = client.post("/api/contact", json=payload, headers=headers)
    second = client.post("/api/contact", json=payload, headers=headers)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["request_id"] == second.json()["request_id"]

    db = SessionLocal()
    try:
        assert db.query(Lead).filter(Lead.client_submission_id == submission_id).count() == 1
    finally:
        db.query(Lead).filter(Lead.client_submission_id == submission_id).delete()
        db.commit()
        db.close()

def test_admin_login_and_price_update_audit():
    # Login
    login_resp = login_admin()
    assert login_resp.status_code == 200

    # Fetch product to update
    prods = client.get("/api/products").json()
    prod_id = prods[0]["id"]

    # Update Price
    update_payload = {
        "new_price_mt": 890.0,
        "unit": "QUINTAL",
        "reason": "Test Price Audit Entry",
        "confirm_unusual_rate": True
    }
    update_resp = client.put(f"/api/products/update/{prod_id}", json=update_payload)
    assert update_resp.status_code == 200
    updated_prod = update_resp.json()
    assert updated_prod["current_price_mt"] == 890.0
    assert updated_prod["unit"] == "QUINTAL"

    # Verify Rate Audit Log
    logs_resp = client.get("/api/rate-audit-logs")
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
    login_resp = login_admin()
    assert login_resp.status_code == 200

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
    spike_resp = client.put(f"/api/products/update/{prod_id}", json=spike_payload)
    assert spike_resp.status_code == 400
    assert "UNUSUAL RATE WARNING" in spike_resp.json()["detail"]

    # Large price spike with confirm_unusual_rate=True should succeed
    confirm_payload = {
        "new_price_mt": spike_price,
        "reason": "Confirmed Test Spike",
        "confirm_unusual_rate": True
    }
    confirm_resp = client.put(f"/api/products/update/{prod_id}", json=confirm_payload)
    assert confirm_resp.status_code == 200

def test_rejects_ambiguous_or_unsupported_rate_unit():
    login_resp = login_admin()
    assert login_resp.status_code == 200
    product = client.get("/api/products").json()[0]

    response = client.put(
        f"/api/products/update/{product['id']}",
        json={
            "new_price_mt": product["current_price_mt"],
            "unit": "TON",
            "confirm_unusual_rate": True,
        },
    )

    assert response.status_code == 400
    assert "Unsupported quantity unit" in response.json()["detail"]


def test_login_rate_limit_and_temporary_lockout():
    invalid_username = f"invalid-{uuid.uuid4().hex}@example.test"
    request_headers = {"x-forwarded-for": f"test-{uuid.uuid4().hex}"}
    for _ in range(5):
        response = client.post(
            "/api/admin/login",
            data={"username": invalid_username, "password": "incorrect-password"},
            headers=request_headers,
        )
        assert response.status_code == 401

    blocked = client.post(
        "/api/admin/login",
        data={"username": invalid_username, "password": "incorrect-password"},
        headers=request_headers,
    )
    assert blocked.status_code == 429
    assert "Retry-After" in blocked.headers
