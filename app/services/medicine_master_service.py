# ============================================
# MediScan AI — Medicine Master Service
# Kaggle import + CRUD + Search
# ============================================

import re
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status

from app.models.medicine_master import MedicineMaster
from app.schemas.medicine_master import MedicineMasterCreate, MedicineMasterUpdate


# ── Kaggle Import ──────────────────────────
def import_from_kaggle(db: Session) -> dict:
    """Download the Kaggle dataset and insert into medicines_master.

    Dataset: mohneesh7/indian-medicine-data
    Uses BULK operations for speed (no row-by-row DB queries).
    """
    try:
        import kagglehub
        import pandas as pd
        import glob
        import os
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Missing packages. Run: pip install kagglehub pandas",
        )

    # 1. Download dataset
    try:
        dataset_path = kagglehub.dataset_download("mohneesh7/indian-medicine-data")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download Kaggle dataset: {str(e)}",
        )

    # 2. Find and read CSV file
    try:
        csv_files = glob.glob(os.path.join(dataset_path, "**", "*.csv"), recursive=True)
        if not csv_files:
            csv_files = glob.glob(os.path.join(dataset_path, "**", "*.xlsx"), recursive=True)
        if not csv_files:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No CSV/XLSX files found in dataset at: {dataset_path}",
            )

        file_path = csv_files[0]
        if file_path.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read dataset file: {str(e)}",
        )

    total_rows = len(df)

    # 3. Clean column names
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # 4. Map columns
    column_map = {
        "medicine_name": _find_column(df, ["product_name", "medicine_name", "name"]),
        "generic_name": _find_column(df, ["salt_composition", "generic_name", "composition", "salt"]),
        "category": _find_column(df, ["sub_category", "category", "type"]),
        "manufacturer": _find_column(df, ["product_manufactured", "manufacturer", "company"]),
        "uses": _find_column(df, ["medicine_desc", "uses", "description", "desc"]),
        "side_effects": _find_column(df, ["side_effects", "sideeffects"]),
        "warnings": _find_column(df, ["drug_interactions", "warnings", "interactions"]),
        "price": _find_column(df, ["product_price", "price", "mrp"]),
    }

    # 5. Load ALL existing medicine names in ONE query (fast duplicate check)
    existing_names = set()
    all_existing = db.query(MedicineMaster.medicine_name).all()
    for row in all_existing:
        if row[0]:
            existing_names.add(row[0].strip().lower())

    # 6. Build all new records in memory (no DB queries in the loop)
    new_records = []
    skipped = 0
    seen_in_batch = set()  # avoid duplicates within the CSV itself

    for _, row in df.iterrows():
        med_name = _safe_str(row, column_map["medicine_name"])
        if not med_name or len(med_name) < 2:
            skipped += 1
            continue

        name_lower = med_name.strip().lower()

        # Skip if already in DB or already seen in this batch
        if name_lower in existing_names or name_lower in seen_in_batch:
            skipped += 1
            continue

        seen_in_batch.add(name_lower)

        new_records.append(MedicineMaster(
            medicine_name=med_name.strip(),
            generic_name=_safe_str(row, column_map["generic_name"]),
            brand_name=med_name.strip(),
            category=_safe_str(row, column_map["category"]),
            strength=None,
            dosage_form=None,
            manufacturer=_safe_str(row, column_map["manufacturer"]),
            uses=_safe_str(row, column_map["uses"]),
            side_effects=_safe_str(row, column_map["side_effects"]),
            warnings=_safe_str(row, column_map["warnings"]),
            prescription_required=False,
            price=_parse_price(row, column_map["price"]),
            stock=0,
        ))

    # 7. Bulk insert all at once
    imported = len(new_records)
    if new_records:
        db.bulk_save_objects(new_records)
        db.commit()

    return {
        "message": "Kaggle import completed successfully!",
        "total_rows_found": total_rows,
        "total_imported": imported,
        "total_skipped": skipped,
    }


# ── Search Medicines ───────────────────────
def search_medicines(db: Session, query: str, limit: int = 20) -> List[MedicineMaster]:
    """Search medicines_master by name, generic_name, or brand_name.

    Partial match + case insensitive.
    """
    search_term = f"%{query.strip()}%"

    results = (
        db.query(MedicineMaster)
        .filter(
            or_(
                MedicineMaster.medicine_name.ilike(search_term),
                MedicineMaster.generic_name.ilike(search_term),
                MedicineMaster.brand_name.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )
    return results


# ── Get by ID ──────────────────────────────
def get_medicine_by_id(db: Session, medicine_id: int) -> MedicineMaster:
    """Get a single medicine from the master catalog by ID."""
    medicine = db.query(MedicineMaster).filter(MedicineMaster.id == medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with id {medicine_id} not found",
        )
    return medicine


# ── List with Pagination ───────────────────
def list_medicines(db: Session, page: int = 1, per_page: int = 20) -> dict:
    """Get paginated list of all medicines."""
    total = db.query(func.count(MedicineMaster.id)).scalar() or 0

    offset = (page - 1) * per_page
    medicines = (
        db.query(MedicineMaster)
        .order_by(MedicineMaster.medicine_name)
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "medicines": medicines,
    }


# ── Create Medicine ────────────────────────
def create_medicine(db: Session, data: MedicineMasterCreate) -> MedicineMaster:
    """Create a new medicine in the master catalog."""
    medicine = MedicineMaster(**data.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


# ── Update Medicine ────────────────────────
def update_medicine(db: Session, medicine_id: int, data: MedicineMasterUpdate) -> MedicineMaster:
    """Update an existing medicine in the master catalog."""
    medicine = get_medicine_by_id(db, medicine_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine


# ── Delete Medicine ────────────────────────
def delete_medicine(db: Session, medicine_id: int) -> bool:
    """Delete a medicine from the master catalog."""
    medicine = get_medicine_by_id(db, medicine_id)
    db.delete(medicine)
    db.commit()
    return True


# ── OCR Integration: Match Medicines ──────
def match_medicines_from_ocr(db: Session, medicine_names: List[str]) -> List[dict]:
    """Given a list of OCR-extracted medicine names, search medicines_master
    and return matched details.

    Used by the prescription processing pipeline.
    """
    matched = []

    for name in medicine_names:
        if not name or len(name) < 2:
            continue

        search_term = f"%{name.strip()}%"

        # Find best match
        result = (
            db.query(MedicineMaster)
            .filter(
                or_(
                    MedicineMaster.medicine_name.ilike(search_term),
                    MedicineMaster.generic_name.ilike(search_term),
                    MedicineMaster.brand_name.ilike(search_term),
                )
            )
            .first()
        )

        if result:
            matched.append({
                "ocr_name": name,
                "matched": True,
                "medicine_id": result.id,
                "medicine_name": result.medicine_name,
                "generic_name": result.generic_name,
                "brand_name": result.brand_name,
                "category": result.category,
                "manufacturer": result.manufacturer,
                "uses": result.uses,
                "side_effects": result.side_effects,
                "warnings": result.warnings,
                "price": result.price,
            })
        else:
            matched.append({
                "ocr_name": name,
                "matched": False,
                "medicine_id": None,
                "medicine_name": name,
                "generic_name": None,
                "brand_name": None,
                "category": None,
                "manufacturer": None,
                "uses": None,
                "side_effects": None,
                "warnings": None,
                "price": None,
            })

    return matched


# ── Helper Functions ───────────────────────

def _find_column(df, possible_names: list) -> Optional[str]:
    """Find the first matching column name in the dataframe."""
    for name in possible_names:
        if name in df.columns:
            return name
    return None


def _safe_str(row, column_name: Optional[str]) -> Optional[str]:
    """Safely get a string value from a dataframe row."""
    if column_name is None:
        return None
    try:
        value = row[column_name]
        if value is None:
            return None
        import pandas as pd
        if pd.isna(value):
            return None
        return str(value).strip()
    except (KeyError, TypeError):
        return None


def _parse_price(row, column_name: Optional[str]) -> Optional[float]:
    """Parse price from a dataframe row, handling formats like '₹125.00'."""
    raw = _safe_str(row, column_name)
    if not raw:
        return None
    try:
        # Remove currency symbols, commas, spaces
        cleaned = re.sub(r"[₹$,\s]", "", raw)
        return float(cleaned)
    except (ValueError, TypeError):
        return None
