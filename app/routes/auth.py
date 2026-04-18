# ============================================
# MediScan AI — Auth Routes
# POST /api/auth/register
# POST /api/auth/login       (form-data — Swagger Authorize)
# POST /api/auth/login-json  (JSON — React Frontend)
# ============================================

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token
from app.services.auth_service import register_user, login_user, login_by_credentials

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account.

    Request body:
        - name: str
        - email: str (unique)
        - password: str
        - phone: str (optional)
        - role: "user" | "pharmacy"

    Returns: access_token + user object
    """
    return register_user(db, user_data)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login with email and password (form-data).

    This is the OAuth2-compatible endpoint used by Swagger Authorize.

    Enter your **email** in the username field.

    Returns: access_token + token_type + user object
    """
    return login_by_credentials(db, form_data.username, form_data.password)


@router.post("/login-json", response_model=Token)
def login_json(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password (JSON body).

    This endpoint is used by the React frontend (Axios/fetch).

    Request body:
        - email: str
        - password: str
        - role: str (optional, for frontend routing)

    Returns: access_token + user object
    """
    return login_user(db, login_data)
