# ============================================
# MediScan AI — Prescription Service
# ============================================

from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.prescription import Prescription
from app.models.medicine import Medicine
from app.models.user import User
from app.schemas.prescription import PrescriptionProcessIn, MedicineIn
from app.utils.priority import classify_priority, parse_medicines_from_text


def process_prescription(db: Session, user_id: int, data: PrescriptionProcessIn) -> Prescription:
    """Process OCR text: classify priority, parse medicines, save to DB."""

    # 1. Classify priority from raw text
    priority = classify_priority(data.raw_text)

    # 2. Create prescription record
    prescription = Prescription(
        user_id=user_id,
        raw_text=data.raw_text,
        priority=priority,
        image_path=data.image_path,
        status="pending",
    )
    db.add(prescription)
    db.flush()  # Get the ID before adding medicines

    # 3. Parse medicines (use provided medicines or parse from text)
    if data.medicines and len(data.medicines) > 0:
        # Frontend/OCR already parsed the medicines
        medicine_data = [m.model_dump() for m in data.medicines]
    else:
        # Parse from raw OCR text
        medicine_data = parse_medicines_from_text(data.raw_text)

    # 4. Save medicines to DB
    for med in medicine_data:
        medicine = Medicine(
            prescription_id=prescription.id,
            medicine_name=med.get("medicine_name", "Unknown"),
            dosage=med.get("dosage", "As prescribed"),
            frequency=med.get("frequency", "As directed"),
            duration=med.get("duration", "As needed"),
        )
        db.add(medicine)

    db.commit()
    db.refresh(prescription)
    return prescription


def get_all_prescriptions(db: Session, user_id: int) -> List[Prescription]:
    """Get all prescriptions for a user, ordered by created_at desc."""
    return (
        db.query(Prescription)
        .filter(Prescription.user_id == user_id)
        .order_by(Prescription.created_at.desc())
        .all()
    )


def get_prescription_by_id(db: Session, prescription_id: int, user_id: int) -> Prescription:
    """Get a single prescription. Verifies ownership."""
    prescription = (
        db.query(Prescription)
        .filter(Prescription.id == prescription_id)
        .first()
    )
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )
    if prescription.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this prescription",
        )
    return prescription


def verify_prescription(
    db: Session, prescription_id: int, user_id: int,
    medicines: List[MedicineIn], new_status: str = "verified",
) -> Prescription:
    """Verify/update a prescription's medicines and status."""
    prescription = get_prescription_by_id(db, prescription_id, user_id)

    # Delete old medicines
    db.query(Medicine).filter(Medicine.prescription_id == prescription.id).delete()

    # Add updated medicines
    for med in medicines:
        medicine = Medicine(
            prescription_id=prescription.id,
            medicine_name=med.medicine_name,
            dosage=med.dosage,
            frequency=med.frequency,
            duration=med.duration,
        )
        db.add(medicine)

    prescription.status = new_status
    db.commit()
    db.refresh(prescription)
    return prescription


def delete_prescription(db: Session, prescription_id: int, user_id: int) -> bool:
    """Delete a prescription. Cascade will remove medicines and orders."""
    prescription = get_prescription_by_id(db, prescription_id, user_id)
    db.delete(prescription)
    db.commit()
    return True


def get_prescriptions_by_priority(db: Session, user_id: Optional[int] = None) -> List[Prescription]:
    """Get all prescriptions sorted by priority for the dashboard.
    If user_id is None, returns all (for pharmacy dashboard)."""
    priority_order = {"critical": 1, "high": 2, "urgent": 3, "regular": 4}

    query = db.query(Prescription)
    if user_id:
        query = query.filter(Prescription.user_id == user_id)

    prescriptions = query.order_by(Prescription.created_at.desc()).all()

    # Sort by priority in Python (since MySQL can't sort by custom enum order easily)
    prescriptions.sort(key=lambda p: priority_order.get(p.priority, 5))
    return prescriptions
