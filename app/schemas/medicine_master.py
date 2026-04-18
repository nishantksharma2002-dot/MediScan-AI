# ============================================
# MediScan AI — Medicine Master Schemas
# ============================================

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Create / Update ────────────────────────
class MedicineMasterCreate(BaseModel):
    """Schema for creating a medicine in the master catalog."""
    medicine_name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    category: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    uses: Optional[str] = None
    side_effects: Optional[str] = None
    warnings: Optional[str] = None
    prescription_required: bool = False
    price: Optional[float] = None
    stock: int = 0


class MedicineMasterUpdate(BaseModel):
    """Schema for updating a medicine (all fields optional)."""
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    category: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    uses: Optional[str] = None
    side_effects: Optional[str] = None
    warnings: Optional[str] = None
    prescription_required: Optional[bool] = None
    price: Optional[float] = None
    stock: Optional[int] = None


# ── Response ───────────────────────────────
class MedicineMasterOut(BaseModel):
    """Full medicine response from the master catalog."""
    id: int
    medicine_name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    category: Optional[str] = None
    strength: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    uses: Optional[str] = None
    side_effects: Optional[str] = None
    warnings: Optional[str] = None
    prescription_required: bool = False
    price: Optional[float] = None
    stock: int = 0
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Search Result ──────────────────────────
class MedicineSearchResult(BaseModel):
    """Lightweight search result."""
    id: int
    medicine_name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None

    model_config = {"from_attributes": True}


# ── Kaggle Import Response ─────────────────
class KaggleImportResponse(BaseModel):
    """Response after importing from Kaggle dataset."""
    message: str
    total_rows_found: int
    total_imported: int
    total_skipped: int


# ── Paginated List Response ────────────────
class MedicineMasterListOut(BaseModel):
    """Paginated list of medicines."""
    total: int
    page: int
    per_page: int
    medicines: List[MedicineMasterOut]
