# ============================================
# MediScan AI — Prescription Routes
# POST /api/prescription/upload       (file upload)
# POST /api/prescriptions/process     (OCR text)
# GET  /api/prescriptions
# GET  /api/prescriptions/{id}
# PUT  /api/prescriptions/{id}/verify
# DELETE /api/prescriptions/{id}
# ============================================

import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.prescription import (
    PrescriptionProcessIn,
    PrescriptionOut,
    PrescriptionVerify,
)
from app.services.prescription_service import (
    process_prescription,
    get_all_prescriptions,
    get_prescription_by_id,
    verify_prescription,
    delete_prescription,
)
from app.utils.security import get_current_user

router = APIRouter(tags=["Prescriptions"])


# ── Upload prescription image ──────────────
@router.post("/prescription/upload", response_model=PrescriptionOut)
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a prescription image file.

    The backend saves the image and creates a prescription record.
    The OCR module should then call /prescriptions/process with the extracted text.

    Accepts: multipart/form-data with 'file' field
    Returns: PrescriptionOut with image_path set
    """
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )

    # Save the file
    upload_dir = os.getenv("UPLOAD_DIR", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, unique_name)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create a prescription with the image path (no OCR text yet)
    data = PrescriptionProcessIn(
        raw_text="",
        image_path=file_path,
    )
    prescription = process_prescription(db, current_user.id, data)
    return prescription


# ── Process OCR text ───────────────────────
@router.post("/prescriptions/process")
def process_ocr_text(
    data: PrescriptionProcessIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Receive OCR-extracted text and process it.

    This is called by the OCR module or frontend after text extraction.

    Request body:
        - raw_text: str (the full OCR output)
        - image_path: str (optional, path to the image)
        - medicines: list (optional, pre-parsed medicines)

    The backend will:
        1. Classify priority (critical/high/urgent/regular)
        2. Parse medicines from text (if not provided)
        3. Save everything to the database
        4. Match medicines against the master catalog

    Returns: prescription data + matched_medicines from catalog
    """
    if not data.raw_text and (not data.medicines or len(data.medicines) == 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either raw_text or medicines must be provided",
        )

    prescription = process_prescription(db, current_user.id, data)

    # Match extracted medicines against the master catalog
    from app.services.medicine_master_service import match_medicines_from_ocr

    medicine_names = [med.medicine_name for med in prescription.medicines]
    matched = match_medicines_from_ocr(db, medicine_names)

    return {
        "prescription": prescription,
        "matched_medicines": matched,
    }


# ── Get all prescriptions ─────────────────
@router.get("/prescriptions", response_model=List[PrescriptionOut])
def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all prescriptions for the current user.

    Returns: List of PrescriptionOut sorted by created_at desc
    """
    return get_all_prescriptions(db, current_user.id)


# ── Get one prescription ─────────────────
@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single prescription by ID.

    Verifies that the prescription belongs to the current user.
    """
    return get_prescription_by_id(db, prescription_id, current_user.id)


# ── Verify/Edit prescription ─────────────
@router.put("/prescriptions/{prescription_id}/verify", response_model=PrescriptionOut)
def verify(
    prescription_id: int,
    data: PrescriptionVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify and update a prescription's medicines.

    Used by the user dashboard to confirm / edit extracted medicines.

    Request body:
        - medicines: list of {medicine_name, dosage, frequency, duration}
        - status: str (default "verified")
    """
    return verify_prescription(
        db, prescription_id, current_user.id,
        data.medicines, data.status,
    )


# ── Delete prescription ──────────────────
@router.delete("/prescriptions/{prescription_id}")
def delete(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a prescription and its associated medicines/orders."""
    delete_prescription(db, prescription_id, current_user.id)
    return {"message": "Prescription deleted successfully"}
