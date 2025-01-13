from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database.database import get_db
from ..database.models import User
from ..auth.session_manager import session_manager

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(
    user_data: UserCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = session_manager.hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create session
    session_manager.create_session(db_user.id, response)
    
    return {"message": "User created successfully"}

@router.post("/login")
async def login(
    user_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not session_manager.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_manager.create_session(user.id, response)
    
    return {"message": "Logged in successfully"}

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    user_id: int = Depends(session_manager.require_auth)
):
    session_manager.end_session(request, response)
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email
    }