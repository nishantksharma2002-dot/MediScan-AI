# ============================================
# MediScan AI — Dashboard Schemas
# ============================================

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Aggregated stats for the pharmacy dashboard."""
    total_orders: int = 0
    critical_orders: int = 0
    pending_orders: int = 0
    completed_orders: int = 0
    processing_orders: int = 0
    total_prescriptions: int = 0


class DashboardPrescription(BaseModel):
    """Prescription for dashboard sorted views."""
    id: int
    priority: str
    status: str
    raw_text: Optional[str] = None
    created_at: Optional[datetime] = None
    medicine_count: int = 0
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}
