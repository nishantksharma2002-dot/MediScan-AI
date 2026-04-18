# ============================================
# MediScan AI — Dashboard Routes
# GET /api/dashboard/prescriptions
# GET /api/dashboard/pending-orders
# PATCH /api/dashboard/orders/{id}/complete
# ============================================

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.prescription import PrescriptionOut
from app.schemas.order import OrderOut
from app.services.prescription_service import get_prescriptions_by_priority
from app.services.order_service import get_all_orders_for_pharmacy, update_order_status, get_order_by_id
from app.utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/prescriptions", response_model=List[PrescriptionOut])
def dashboard_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all prescriptions sorted by priority for the dashboard.

    Priority order: Critical → High → Urgent → Regular
    """
    # If pharmacy role, show all prescriptions; else show only user's
    user_id = None if current_user.role == "pharmacy" else current_user.id
    return get_prescriptions_by_priority(db, user_id)


@router.get("/pending-orders", response_model=List[OrderOut])
def get_pending_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all pending orders (status != completed)."""
    all_orders = get_all_orders_for_pharmacy(db)
    return [o for o in all_orders if o.get("order_status") != "completed"]


@router.patch("/orders/{order_id}/complete", response_model=OrderOut)
def mark_completed(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark an order as completed."""
    update_order_status(db, order_id, "completed")
    return get_order_by_id(db, order_id)
