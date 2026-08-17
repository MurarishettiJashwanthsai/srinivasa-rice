from typing import Optional
from sqlalchemy import Boolean, Integer, String, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class RicePrice(Base):
    __tablename__ = "rice_prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    variety_name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    grade: Mapped[Optional[str]] = mapped_column(String, default="Standard Export", nullable=True)
    current_price_mt: Mapped[float] = mapped_column(Float, nullable=False)
    previous_price_mt: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentage_change: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    trend: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String, default="INR", nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String, default="MT", nullable=True)
    price_basis: Mapped[Optional[str]] = mapped_column(String, default="EX_MILL", nullable=True)
    market_location: Mapped[Optional[str]] = mapped_column(String, default="Miryalaguda, Telangana", nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, default="published", nullable=True)
    public_note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    internal_note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String, default="system", nullable=True)
    last_updated: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    slug: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    review_status: Mapped[Optional[str]] = mapped_column(String, default="approved", nullable=True)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    moisture: Mapped[Optional[str]] = mapped_column(String, default="12-14% Max", nullable=True)
    processing: Mapped[Optional[str]] = mapped_column(String, default="100% Sortexed", nullable=True)

class RateAuditLog(Base):
    __tablename__ = "rate_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rate_id: Mapped[int] = mapped_column(Integer, nullable=False)
    variety_name: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    old_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    new_price: Mapped[float] = mapped_column(Float, nullable=False)
    admin_user: Mapped[str] = mapped_column(String, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp: Mapped[str] = mapped_column(String, nullable=False)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_id: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    whatsapp: Mapped[str] = mapped_column(String, nullable=False)
    destination_country: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    destination_port: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    product_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    quantity_mt: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    quantity_unit: Mapped[Optional[str]] = mapped_column(String, default="MT", nullable=True)
    packaging_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    incoterm: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    inquiry_text: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[Optional[str]] = mapped_column(String, default="new", nullable=True)
    source_page: Mapped[Optional[str]] = mapped_column(String, default="contact", nullable=True)
    notification_status: Mapped[Optional[str]] = mapped_column(String, default="pending", nullable=True)
    notification_channel: Mapped[Optional[str]] = mapped_column(String, default="webhook", nullable=True)
    notification_attempted_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notification_delivered_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    notification_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    privacy_consent: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    marketing_consent: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    consent_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmation_status: Mapped[Optional[str]] = mapped_column(String, default="pending", nullable=True)
    confirmation_channel: Mapped[Optional[str]] = mapped_column(String, default="none", nullable=True)
    confirmation_attempted_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmation_delivered_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmation_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    client_submission_id: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    ip_fingerprint: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, index=True, nullable=False)
    issued_at: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[str] = mapped_column(String, nullable=False)
    last_seen_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    revoked_at: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ip_fingerprint: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class AdminLoginHistory(Base):
    __tablename__ = "admin_login_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, index=True, nullable=False)
    outcome: Mapped[str] = mapped_column(String, index=True, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ip_fingerprint: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(String, index=True, nullable=False)
