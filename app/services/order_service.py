# ============================================
# MediScan AI — Order Service
# ============================================

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.prescription import Prescription
from app.models.user import User


def create_order(db: Session, user_id: int, prescription_id: int, delivery_address: Optional[str] = None) -> Order:
    """Create a new order from a verified prescription."""
    # Verify prescription exists and belongs to user
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )
    if prescription.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    # Create order
    order = Order(
        prescription_id=prescription_id,
        user_id=user_id,
        order_status="pending",
        delivery_address=delivery_address,
    )
    db.add(order)

    # Update prescription status
    prescription.status = "ordered"

    db.commit()
    db.refresh(order)
    return order


def get_user_orders(db: Session, user_id: int, status_filter: Optional[str] = None) -> List[dict]:
    """Get all orders for a user with prescription + medicine details."""
    query = (
        db.query(Order)
        .options(
            joinedload(Order.prescription).joinedload(Prescription.medicines),
            joinedload(Order.user),
        )
        .filter(Order.user_id == user_id)
    )
    if status_filter and status_filter != "all":
        query = query.filter(Order.order_status == status_filter)

    orders = query.order_by(Order.created_at.desc()).all()
    return _enrich_orders(orders)


def get_order_by_id(db: Session, order_id: int, user_id: Optional[int] = None) -> dict:
    """Get a single order with full details."""
    query = (
        db.query(Order)
        .options(
            joinedload(Order.prescription).joinedload(Prescription.medicines),
            joinedload(Order.user),
        )
        .filter(Order.id == order_id)
    )
    order = query.first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    if user_id and order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    enriched = _enrich_orders([order])
    return enriched[0] if enriched else None


def update_order_status(db: Session, order_id: int, new_status: str) -> Order:
    """Update an order's status (used by pharmacy dashboard)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    valid_statuses = ["pending", "processing", "completed"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    order.order_status = new_status
    db.commit()
    db.refresh(order)
    return order


def get_all_orders_for_pharmacy(db: Session, status_filter: Optional[str] = None) -> List[dict]:
    """Get all orders across all users (pharmacy view) with priority sorting."""
    query = (
        db.query(Order)
        .options(
            joinedload(Order.prescription).joinedload(Prescription.medicines),
            joinedload(Order.user),
        )
    )
    if status_filter and status_filter != "all":
        query = query.filter(Order.order_status == status_filter)

    orders = query.order_by(Order.created_at.desc()).all()
    enriched = _enrich_orders(orders)

    # Sort by priority (critical first)
    priority_rank = {"critical": 0, "high": 1, "urgent": 2, "regular": 3}
    enriched.sort(key=lambda o: priority_rank.get(o.get("priority", "regular"), 4))
    return enriched


def _enrich_orders(orders: List[Order]) -> List[dict]:
    """Convert Order ORM objects into enriched dicts with prescription data."""
    result = []
    for order in orders:
        medicines = []
        priority = "regular"
        if order.prescription:
            priority = order.prescription.priority or "regular"
            for med in order.prescription.medicines:
                medicines.append({
                    "id": med.id,
                    "medicine_name": med.medicine_name,
                    "dosage": med.dosage,
                    "frequency": med.frequency,
                    "duration": med.duration,
                })

        result.append({
            "id": order.id,
            "prescription_id": order.prescription_id,
            "user_id": order.user_id,
            "order_status": order.order_status,
            "delivery_address": order.delivery_address,
            "created_at": order.created_at,
            "patient_name": order.user.name if order.user else "Unknown",
            "priority": priority,
            "medicines": medicines,
        })
    return result
