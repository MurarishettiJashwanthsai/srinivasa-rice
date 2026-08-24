from sqlalchemy import text
from database import engine, Base
import models # Ensure models are loaded for create_all

def run_migration():
    Base.metadata.create_all(bind=engine)
    columns_to_add = [
        ("rice_prices", "grade", "VARCHAR DEFAULT 'Standard Export'"),
        ("rice_prices", "currency", "VARCHAR DEFAULT 'INR'"),
        ("rice_prices", "unit", "VARCHAR DEFAULT 'MT'"),
        ("rice_prices", "price_basis", "VARCHAR DEFAULT 'EX_MILL'"),
        ("rice_prices", "market_location", "VARCHAR DEFAULT 'Miryalaguda, Telangana'"),
        ("rice_prices", "status", "VARCHAR DEFAULT 'published'"),
        ("rice_prices", "public_note", "VARCHAR"),
        ("rice_prices", "internal_note", "VARCHAR"),
        ("rice_prices", "updated_by", "VARCHAR DEFAULT 'system'"),
        ("rice_prices", "last_updated", "VARCHAR"),
        ("rice_prices", "image_url", "VARCHAR"),
        ("rice_prices", "moisture", "VARCHAR DEFAULT '12-14% Max'"),
        ("rice_prices", "processing", "VARCHAR DEFAULT '100% Sortexed'"),
        ("rice_prices", "slug", "VARCHAR"),
        ("rice_prices", "review_status", "VARCHAR DEFAULT 'approved'"),
        ("rice_prices", "reviewed_by", "VARCHAR"),
        ("leads", "request_id", "VARCHAR"),
        ("leads", "email", "VARCHAR"),
        ("leads", "destination_country", "VARCHAR"),
        ("leads", "destination_port", "VARCHAR"),
        ("leads", "product_name", "VARCHAR"),
        ("leads", "quantity_mt", "FLOAT"),
        ("leads", "quantity_unit", "VARCHAR DEFAULT 'MT'"),
        ("leads", "packaging_type", "VARCHAR"),
        ("leads", "incoterm", "VARCHAR"),
        ("leads", "status", "VARCHAR DEFAULT 'new'"),
        ("leads", "source_page", "VARCHAR DEFAULT 'contact'"),
        ("leads", "notification_status", "VARCHAR DEFAULT 'legacy'"),
        ("leads", "notification_channel", "VARCHAR DEFAULT 'none'"),
        ("leads", "notification_attempted_at", "VARCHAR"),
        ("leads", "notification_delivered_at", "VARCHAR"),
        ("leads", "notification_error", "TEXT"),
        ("leads", "privacy_consent", "BOOLEAN DEFAULT FALSE"),
        ("leads", "marketing_consent", "BOOLEAN DEFAULT FALSE"),
        ("leads", "consent_at", "VARCHAR"),
        ("leads", "confirmation_status", "VARCHAR DEFAULT 'pending'"),
        ("leads", "confirmation_channel", "VARCHAR DEFAULT 'none'"),
        ("leads", "confirmation_attempted_at", "VARCHAR"),
        ("leads", "confirmation_delivered_at", "VARCHAR"),
        ("leads", "confirmation_error", "TEXT"),
        ("leads", "client_submission_id", "VARCHAR"),
        ("leads", "ip_fingerprint", "VARCHAR"),
        ("leads", "created_at", "VARCHAR"),
        ("leads", "updated_at", "VARCHAR"),
        ("leads", "updated_by", "VARCHAR"),
        ("leads", "follow_up_at", "VARCHAR"),
        ("leads", "internal_notes", "TEXT"),
    ]

    with engine.begin() as conn:
        for table, col, col_type in columns_to_add:
            try:
                if engine.dialect.name == "postgresql":
                    check_sql = text("SELECT 1 FROM information_schema.columns WHERE table_name=:table AND column_name=:col")
                    res = conn.execute(check_sql, {"table": table, "col": col}).fetchone()
                    if res is not None:
                        continue
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                print(f"Added column {col} to {table}")
            except Exception as error:
                print(f"Migration warning for {table}.{col}: {error}")

        for index_name, table, column in [
            ("ix_leads_client_submission_id", "leads", "client_submission_id"),
            ("ix_leads_ip_fingerprint", "leads", "ip_fingerprint"),
        ]:
            try:
                conn.execute(text(f"CREATE INDEX IF NOT EXISTS {index_name} ON {table} ({column})"))
            except Exception as error:
                print(f"Index warning for {table}.{column}: {error}")

        # Add race-safe idempotency only when genuine historical rows are already unique.
        # If duplicates exist, preserve them and report the issue instead of deleting data.
        for index_name, column in [
            ("uq_leads_request_id_nonempty", "request_id"),
            ("uq_leads_client_submission_id_nonempty", "client_submission_id"),
        ]:
            duplicate = conn.execute(text(
                f"SELECT {column}, COUNT(*) FROM leads "
                f"WHERE {column} IS NOT NULL AND {column} <> '' "
                f"GROUP BY {column} HAVING COUNT(*) > 1 LIMIT 1"
            )).fetchone()
            if duplicate:
                print(
                    f"Integrity warning: unique index {index_name} was not created because "
                    f"duplicate historical {column} values exist. No records were changed."
                )
                continue
            try:
                conn.execute(text(
                    f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} ON leads ({column}) "
                    f"WHERE {column} IS NOT NULL AND {column} <> ''"
                ))
            except Exception as error:
                print(f"Unique index warning for leads.{column}: {error}")

if __name__ == "__main__":
    run_migration()
