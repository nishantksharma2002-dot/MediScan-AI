# ============================================
# MediScan AI — Prescription Model
# ============================================

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="regular", index=True)
    image_path = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="prescriptions")
    medicines = relationship("Medicine", back_populates="prescription", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="prescription", cascade="all, delete-orphan")

    # Index on priority for dashboard sorting
    __table_args__ = (
        Index("idx_prescription_priority", "priority"),
    )

    def __repr__(self):
        return f"<Prescription id={self.id} priority={self.priority}>"
