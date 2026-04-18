# ============================================
# MediScan AI — Medicine Master Model
# Master catalog of medicines (from Kaggle dataset)
# ============================================

from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class MedicineMaster(Base):
    __tablename__ = "medicines_master"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_name = Column(String(300), nullable=False, index=True)
    generic_name = Column(String(500), nullable=True)         # salt_composition
    brand_name = Column(String(300), nullable=True, index=True)
    category = Column(String(200), nullable=True)              # sub_category
    strength = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)
    manufacturer = Column(String(300), nullable=True)          # product_manufactured
    uses = Column(Text, nullable=True)                         # medicine_desc
    side_effects = Column(Text, nullable=True)                 # side_effects
    warnings = Column(Text, nullable=True)                     # drug_interactions
    prescription_required = Column(Boolean, default=False)
    price = Column(Float, nullable=True)                       # product_price
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<MedicineMaster id={self.id} name={self.medicine_name}>"
