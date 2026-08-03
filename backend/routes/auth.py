from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from db import get_db
from schemas import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserMeResponse,
)
from security import (
    clear_auth_cookie,
    create_access_token,
    get_current_user,
    hash_password,
    set_auth_cookie,
    verify_password,
)
import models

router = APIRouter()

VALID_EXPERIENCE = {"Beginner", "Intermediate", "Advanced"}


def _token_for_user(user: models.User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        experience_level=user.experience_level,
    )


def _attach_session(response: Response, user: models.User) -> TokenResponse:
    """Issue JWT in JSON (API clients) and httpOnly cookie (browser)."""
    payload = _token_for_user(user)
    set_auth_cookie(response, payload.access_token)
    return payload


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    if payload.experience_level not in VALID_EXPERIENCE:
        raise HTTPException(status_code=400, detail="Invalid experience level")

    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=payload.full_name.strip(),
        email=payload.email,
        password_hash=hash_password(payload.password),
        experience_level=payload.experience_level,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-login after signup so the product funnel starts immediately.
    return _attach_session(response, new_user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    # Same 401 for unknown email and bad password (avoid user enumeration)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _attach_session(response, user)


@router.post("/logout")
def logout(response: Response):
    """Clear the httpOnly session cookie (browser logout)."""
    clear_auth_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserMeResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return UserMeResponse(
        user_id=current_user.id,
        full_name=current_user.full_name,
        experience_level=current_user.experience_level,
        email=current_user.email,
    )


@router.patch("/me", response_model=UserMeResponse)
def update_me(
    payload: UpdateProfileRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        name = payload.full_name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        current_user.full_name = name

    if payload.experience_level is not None:
        if payload.experience_level not in VALID_EXPERIENCE:
            raise HTTPException(status_code=400, detail="Invalid experience level")
        current_user.experience_level = payload.experience_level

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return UserMeResponse(
        user_id=current_user.id,
        full_name=current_user.full_name,
        experience_level=current_user.experience_level,
        email=current_user.email,
    )
