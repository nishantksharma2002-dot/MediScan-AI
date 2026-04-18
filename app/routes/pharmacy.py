# ============================================
# MediScan AI — Pharmacy Routes
# GET /api/pharmacy/stats
# GET /api/pharmacy/orders
# ============================================

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.prescription import Prescription
from app.schemas.dashboard import DashboardStats
from app.schemas.order import OrderOut
from app.services.order_service import get_all_orders_for_pharmacy
from app.utils.security import get_current_user

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])


@router.get("/stats", response_model=DashboardStats)
def get_pharmacy_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get aggregated stats for the pharmacy dashboard.

    Returns counts of:
        - total_orders
        - critical_orders
        - pending_orders
        - completed_orders
        - processing_orders
        - total_prescriptions
    """
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.order_status == "pending").scalar() or 0
    processing_orders = db.query(func.count(Order.id)).filter(Order.order_status == "processing").scalar() or 0
    completed_orders = db.query(func.count(Order.id)).filter(Order.order_status == "completed").scalar() or 0
    total_prescriptions = db.query(func.count(Prescription.id)).scalar() or 0

    # Critical orders = orders linked to critical-priority prescriptions
    critical_orders = (
        db.query(func.count(Order.id))
        .join(Prescription, Order.prescription_id == Prescription.id)
        .filter(Prescription.priority == "critical")
        .filter(Order.order_status != "completed")
        .scalar() or 0
    )

    return DashboardStats(
        total_orders=total_orders,
        critical_orders=critical_orders,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        processing_orders=processing_orders,
        total_prescriptions=total_prescriptions,
    )


@router.get("/orders", response_model=List[OrderOut])
def get_pharmacy_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all orders for pharmacy (across all users), sorted by priority.

    Query params:
        - status: filter by order status (optional)
    """
    return get_all_orders_for_pharmacy(db, status)
