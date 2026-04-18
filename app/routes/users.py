# ============================================
# MediScan AI — User Routes
# GET  /api/users/me
# PUT  /api/users/me
# ============================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return current_user


@router.put("/me", response_model=UserOut)
def update_profile(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile.

    Request body (all optional):
        - name: str
        - email: str
        - phone: str
    """
    if updates.name is not None:
        current_user.name = updates.name
    if updates.email is not None:
        current_user.email = updates.email
    if updates.phone is not None:
        current_user.phone = updates.phone

    db.commit()
    db.refresh(current_user)
    return current_user
