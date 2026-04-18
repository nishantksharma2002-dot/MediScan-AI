# ============================================
# MediScan AI — Medicines Routes
# POST   /api/medicines/import-kaggle
# GET    /api/medicines/search?q=
# GET    /api/medicines
# GET    /api/medicines/{id}
# PUT    /api/medicines/{id}
# DELETE /api/medicines/{id}
# POST   /api/medicines/match-ocr
# ============================================

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.medicine_master import (
    MedicineMasterOut,
    MedicineMasterCreate,
    MedicineMasterUpdate,
    MedicineSearchResult,
    KaggleImportResponse,
    MedicineMasterListOut,
)
from app.services.medicine_master_service import (
    import_from_kaggle,
    search_medicines,
    get_medicine_by_id,
    list_medicines,
    create_medicine,
    update_medicine,
    delete_medicine,
    match_medicines_from_ocr,
)

router = APIRouter(prefix="/medicines", tags=["Medicines Master"])


# ── Import from Kaggle ─────────────────────
@router.post("/import-kaggle", response_model=KaggleImportResponse)
def kaggle_import(db: Session = Depends(get_db)):
    """Import medicines from the Kaggle dataset: mohneesh7/indian-medicine-data

    This downloads the dataset using kagglehub, reads it with pandas,
    maps columns to medicines_master fields, and inserts rows into MySQL.

    - Skips duplicate medicine names
    - Returns total_rows_found, total_imported, total_skipped
    """
    result = import_from_kaggle(db)
    return result


# ── Search Medicines ───────────────────────
@router.get("/search", response_model=List[MedicineSearchResult])
def search(
    q: str = Query(..., min_length=1, description="Search query (partial, case-insensitive)"),
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: Session = Depends(get_db),
):
    """Search medicines by name, generic name, or brand name.

    - Partial match (e.g. 'para' matches 'Paracetamol')
    - Case insensitive
    - Searches: medicine_name, generic_name, brand_name
    """
    return search_medicines(db, q, limit)


# ── List Medicines (Paginated) ─────────────
@router.get("", response_model=MedicineMasterListOut)
def list_all(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Get a paginated list of all medicines in the master catalog.

    Query params:
        - page: page number (default 1)
        - per_page: items per page (default 20, max 100)
    """
    return list_medicines(db, page, per_page)


# ── Get Medicine Details ───────────────────
@router.get("/{medicine_id}", response_model=MedicineMasterOut)
def get_details(
    medicine_id: int,
    db: Session = Depends(get_db),
):
    """Get full details of a single medicine by ID."""
    return get_medicine_by_id(db, medicine_id)


# ── Create Medicine ────────────────────────
@router.post("", response_model=MedicineMasterOut, status_code=201)
def create(
    data: MedicineMasterCreate,
    db: Session = Depends(get_db),
):
    """Add a new medicine to the master catalog.

    Request body:
        - medicine_name: str (required)
        - generic_name, brand_name, category, etc. (optional)
    """
    return create_medicine(db, data)


# ── Update Medicine ────────────────────────
@router.put("/{medicine_id}", response_model=MedicineMasterOut)
def update(
    medicine_id: int,
    data: MedicineMasterUpdate,
    db: Session = Depends(get_db),
):
    """Update a medicine in the master catalog.

    Request body: all fields optional, only provided fields are updated.
    """
    return update_medicine(db, medicine_id, data)


# ── Delete Medicine ────────────────────────
@router.delete("/{medicine_id}")
def delete(
    medicine_id: int,
    db: Session = Depends(get_db),
):
    """Delete a medicine from the master catalog."""
    delete_medicine(db, medicine_id)
    return {"message": f"Medicine {medicine_id} deleted successfully"}


# ── OCR Match ──────────────────────────────
@router.post("/match-ocr")
def match_ocr(
    medicine_names: List[str],
    db: Session = Depends(get_db),
):
    """Match OCR-extracted medicine names against the master catalog.

    Request body: list of medicine name strings

    Returns for each name:
        - matched: bool (found in catalog or not)
        - medicine details if matched
    """
    return match_medicines_from_ocr(db, medicine_names)
