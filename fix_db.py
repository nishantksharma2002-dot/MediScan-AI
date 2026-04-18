"""
MediScan AI — Database Fix Script
Drops and recreates all tables to match the SQLAlchemy models.

Run with:  python fix_db.py
"""

import os
import sys

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database import engine, Base

# Import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.prescription import Prescription
from app.models.medicine import Medicine
from app.models.order import Order
from app.models.medicine_master import MedicineMaster

print("=" * 50)
print("MediScan AI — Database Fix")
print("=" * 50)

# Show current tables
from sqlalchemy import inspect, text

inspector = inspect(engine)
existing_tables = inspector.get_table_names()
print(f"\nExisting tables: {existing_tables}")

# Check columns in prescriptions table
if "prescriptions" in existing_tables:
    cols = [c["name"] for c in inspector.get_columns("prescriptions")]
    print(f"prescriptions columns: {cols}")

if "orders" in existing_tables:
    cols = [c["name"] for c in inspector.get_columns("orders")]
    print(f"orders columns: {cols}")

if "medicines" in existing_tables:
    cols = [c["name"] for c in inspector.get_columns("medicines")]
    print(f"medicines columns: {cols}")

if "users" in existing_tables:
    cols = [c["name"] for c in inspector.get_columns("users")]
    print(f"users columns: {cols}")

if "medicines_master" in existing_tables:
    cols = [c["name"] for c in inspector.get_columns("medicines_master")]
    print(f"medicines_master columns: {cols}")

print("\n--- Dropping all tables and recreating... ---")

# Drop all tables in correct order (respecting foreign keys)
with engine.begin() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
    for table in ["orders", "medicines", "prescriptions", "users", "medicines_master"]:
        if table in existing_tables:
            conn.execute(text(f"DROP TABLE IF EXISTS `{table}`"))
            print(f"  Dropped: {table}")
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

# Recreate all tables from SQLAlchemy models
Base.metadata.create_all(bind=engine)
print("\n  All tables recreated from SQLAlchemy models!")

# Verify
inspector = inspect(engine)
for table in inspector.get_table_names():
    cols = [c["name"] for c in inspector.get_columns(table)]
    print(f"\n  {table}: {cols}")

print("\n" + "=" * 50)
print("Database fix complete! Restart the server.")
print("=" * 50)
