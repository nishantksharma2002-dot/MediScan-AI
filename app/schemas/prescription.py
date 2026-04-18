# ============================================
# MediScan AI — Prescription & Medicine Schemas
# ============================================

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class MedicineIn(BaseModel):
    """Schema for incoming medicine data."""
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None


class MedicineOut(BaseModel):
    """Schema for medicine response."""
    id: int
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

    model_config = {"from_attributes": True}


class PrescriptionProcessIn(BaseModel):
    """Schema for processing OCR text into a prescription.
    This is what the OCR module / frontend sends."""
    raw_text: str
    image_path: Optional[str] = None
    medicines: Optional[List[MedicineIn]] = None  # Pre-parsed medicines (optional)


class PrescriptionVerify(BaseModel):
    """Schema for verifying / editing a prescription's medicines."""
    medicines: List[MedicineIn]
    status: str = "verified"


class PrescriptionOut(BaseModel):
    """Full prescription response with medicines."""
    id: int
    user_id: int
    raw_text: Optional[str] = None
    priority: str
    image_path: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    medicines: List[MedicineOut] = []

    model_config = {"from_attributes": True}


class PrescriptionListOut(BaseModel):
    """Lightweight prescription for list views."""
    id: int
    priority: str
    status: str
    created_at: Optional[datetime] = None
    medicine_count: int = 0

    model_config = {"from_attributes": True}
