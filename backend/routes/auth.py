from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from db import SessionLocal
import models

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Password Helpers ----------------
def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# ---------------- Signup ----------------
@router.post("/signup")
def signup(full_name: str, email: str, password: str, experience_level: str, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        experience_level=experience_level
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id
    }


# ---------------- Login ----------------
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "full_name": user.full_name,
        "experience_level": user.experience_level
    }