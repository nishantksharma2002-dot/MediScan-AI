# ============================================
# MediScan AI — Auth Service
# ============================================

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token


def register_user(db: Session, user_data: UserCreate) -> dict:
    """Register a new user. Returns user + token."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(data={"sub": str(new_user.id)})

    return _build_token_response(new_user, token)


def login_user(db: Session, login_data: UserLogin) -> dict:
    """Authenticate via JSON body (used by React frontend)."""
    return login_by_credentials(db, login_data.email, login_data.password)


def login_by_credentials(db: Session, email: str, password: str) -> dict:
    """Authenticate with email + password strings.

    Used by both:
      - Swagger Authorize (OAuth2PasswordRequestForm → username = email)
      - React frontend (JSON body → email field)
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate token
    token = create_access_token(data={"sub": str(user.id)})

    return _build_token_response(user, token)


def _build_token_response(user: User, token: str) -> dict:
    """Build the standard token response dict."""
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at,
        },
    }
