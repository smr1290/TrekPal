from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from schemas import LoginRequest, SignupRequest, SignupResponse, TokenResponse, UserMeResponse
from security import create_access_token, get_current_user, hash_password, verify_password
import models

router = APIRouter()


@router.post("/signup", response_model=SignupResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        experience_level=payload.experience_level,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return SignupResponse(message="User created successfully", user_id=new_user.id)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    # Same 401 for unknown email and bad password (avoid user enumeration)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        experience_level=user.experience_level,
    )


@router.get("/me", response_model=UserMeResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return UserMeResponse(
        user_id=current_user.id,
        full_name=current_user.full_name,
        experience_level=current_user.experience_level,
        email=current_user.email,
    )
