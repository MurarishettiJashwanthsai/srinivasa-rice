import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Fallback to local SQLite if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./market_data.db")

# SQLite needs multithreading support for FastAPI. PostgreSQL connections can be
# closed by the database while Render is idle, so validate pooled connections
# before every checkout and recycle them regularly instead of returning a 500.
is_sqlite = DATABASE_URL.startswith("sqlite")
engine_options = {
    "connect_args": {"check_same_thread": False} if is_sqlite else {},
}
if not is_sqlite:
    engine_options.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_use_lifo": True,
    })

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
