# ============================================
# MediScan AI — Order Routes
# POST  /api/orders
# GET   /api/orders
# GET   /api/orders/{id}
# PATCH /api/orders/{id}/status
# ============================================

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.services.order_service import (
    create_order,
    get_user_orders,
    get_order_by_id,
    update_order_status,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut)
def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new order from a verified prescription.

    Request body:
        - prescription_id: int
        - delivery_address: str (optional)
    """
    order = create_order(db, current_user.id, data.prescription_id, data.delivery_address)

    # Return enriched order
    enriched = get_order_by_id(db, order.id)
    return enriched


@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = Query(None, description="Filter by status: pending, processing, completed"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all orders for the current user.

    Query params:
        - status: filter by order status (optional)
    """
    return get_user_orders(db, current_user.id, status)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single order by ID."""
    return get_order_by_id(db, order_id, current_user.id)


@router.patch("/{order_id}/status", response_model=OrderOut)
def change_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an order's status.

    Request body:
        - status: "pending" | "processing" | "completed"
    """
    update_order_status(db, order_id, data.status)
    return get_order_by_id(db, order_id)
