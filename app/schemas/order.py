# ============================================
# MediScan AI — Order Schemas
# ============================================

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.prescription import MedicineOut


class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    prescription_id: int
    delivery_address: Optional[str] = None


class OrderOut(BaseModel):
    """Schema for order response."""
    id: int
    prescription_id: int
    user_id: int
    order_status: str
    delivery_address: Optional[str] = None
    created_at: Optional[datetime] = None
    # Nested data for pharmacy dashboard
    patient_name: Optional[str] = None
    priority: Optional[str] = None
    medicines: List[MedicineOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status."""
    status: str  # pending | processing | completed
