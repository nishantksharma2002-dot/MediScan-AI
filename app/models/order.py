# ============================================
# MediScan AI — Order Model
# ============================================

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_status = Column(String(20), nullable=False, default="pending")
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prescription = relationship("Prescription", back_populates="orders")
    user = relationship("User", back_populates="orders")

    def __repr__(self):
        return f"<Order id={self.id} status={self.order_status}>"
