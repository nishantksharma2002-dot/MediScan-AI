# ============================================
# MediScan AI — User Schemas
# ============================================

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: str = "user"  # user | pharmacy


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str
    role: str = "user"


class UserOut(BaseModel):
    """Schema for user response (no password)."""
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Schema for profile update."""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut
