# ============================================
# MediScan AI — Medicine Model
# ============================================

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    medicine_name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)

    # Relationship
    prescription = relationship("Prescription", back_populates="medicines")

    def __repr__(self):
        return f"<Medicine id={self.id} name={self.medicine_name}>"
