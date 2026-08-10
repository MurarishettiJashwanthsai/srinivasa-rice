import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from database import engine, get_db
from sqlalchemy import text

db = next(get_db())
try:
    db.execute(text("ALTER TABLE rice_prices ADD COLUMN moisture VARCHAR DEFAULT '12-14% Max'"))
    db.commit()
    print("Moisture added")
except Exception as e:
    print(f"Error 1: {e}")

try:
    db.execute(text("ALTER TABLE rice_prices ADD COLUMN processing VARCHAR DEFAULT '100% Sortexed'"))
    db.commit()
    print("Processing added")
except Exception as e:
    print(f"Error 2: {e}")

