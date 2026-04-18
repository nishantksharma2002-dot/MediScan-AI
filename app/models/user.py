# ============================================
# MediScan AI — User Model
# ============================================

from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False, default="user")  # user | pharmacy
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
