from sqlalchemy import text
from database import engine, Base
from models import RateAuditLog

def run_migration():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
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
            ("rice_prices", "moisture", "VARCHAR DEFAULT '12-14% Max'"),
            ("rice_prices", "processing", "VARCHAR DEFAULT '100% Sortexed'"),
            ("leads", "request_id", "VARCHAR"),
            ("leads", "email", "VARCHAR"),
            ("leads", "destination_country", "VARCHAR"),
            ("leads", "destination_port", "VARCHAR"),
            ("leads", "product_name", "VARCHAR"),
            ("leads", "quantity_mt", "FLOAT"),
            ("leads", "packaging_type", "VARCHAR"),
            ("leads", "incoterm", "VARCHAR"),
            ("leads", "status", "VARCHAR DEFAULT 'new'"),
            ("leads", "source_page", "VARCHAR DEFAULT 'contact'"),
        ]

        for table, col, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"Added column {col} to {table}")
            except Exception as e:
                pass

if __name__ == "__main__":
    run_migration()
