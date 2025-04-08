from fastapi import APIRouter, Depends, HTTPException, Request, Response, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database.database import get_db
from ..database.models import User
from ..auth.session_manager import session_manager
import os
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.responses import RedirectResponse
import json

router = APIRouter()

# OAuth setup
config = Config(".env")
oauth = OAuth(config)

# Configure Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "")
FRONTEND_SUCCESS_PATH = os.getenv("FRONTEND_SUCCESS_PATH", "/calculator")
FRONTEND_ERROR_PATH = os.getenv("FRONTEND_ERROR_PATH", "/login?error=google_auth_failed")

LOGIN_RATE_LIMIT_MAX = int(os.getenv("LOGIN_RATE_LIMIT_MAX", "10"))
LOGIN_RATE_LIMIT_PERIOD = int(os.getenv("LOGIN_RATE_LIMIT_PERIOD", "60"))

if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    timezone: Optional[str] = "UTC"  # Accept timezone during registration

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    timezone: Optional[str] = None  # Accept timezone during login

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
        name=user_data.name,
        hashed_password=hashed_password,
        timezone=user_data.timezone  # Save the timezone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create session
    session_manager.create_session(db_user.id, response)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
        "timezone": db_user.timezone
    }

@router.post("/login")
async def login(
    user_data: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    # Apply stricter rate limiting for login attempts
    # Only 5 login attempts per minute
    session_manager.rate_limiter.limit_request(request, max_requests=LOGIN_RATE_LIMIT_MAX, period=LOGIN_RATE_LIMIT_PERIOD)
    
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not session_manager.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update timezone if provided
    if user_data.timezone:
        user.timezone = user_data.timezone
        db.commit()
    
    # Create session
    session_manager.create_session(user.id, response)
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "timezone": user.timezone
    }

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
        "email": user.email,
        "name": user.name,
        "profile_picture": user.profile_picture,
        "timezone": user.timezone
    }

@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login flow"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="Google OAuth is not configured. Contact the administrator."
        )
    
    # Get timezone parameter if provided
    timezone = request.query_params.get("timezone", "UTC")
    
    # Add timezone to state or session to pass it to callback
    # Set it in session for use during callback
    request.session["timezone"] = timezone
    
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)

@router.get("/google/callback")
async def google_callback(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback and create or login user"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info or not user_info.get("email"):
            raise HTTPException(status_code=400, detail="Invalid Google account")
        
        # Check if user already exists with this Google ID
        google_id = user_info.get("sub")
        user = db.query(User).filter(User.google_id == google_id).first()
        
        # Get timezone from session if it was set during the login request
        timezone = request.session.get("timezone", "UTC")
        
        if not user:
            # Check if user exists with this email
            email = user_info.get("email")
            user = db.query(User).filter(User.email == email).first()
            
            if user:
                # Update existing user with Google info
                user.google_id = google_id
                user.profile_picture = user_info.get("picture")
                # Update timezone if not already set
                if not user.timezone or user.timezone == "UTC":
                    user.timezone = timezone
            else:
                # Create new user
                user = User(
                    email=email,
                    name=user_info.get("name"),
                    google_id=google_id,
                    profile_picture=user_info.get("picture"),
                    timezone=timezone
                )
                db.add(user)
            
            db.commit()
            db.refresh(user)
        else:
            # Always update timezone for existing users
            if timezone != "UTC":  # Only update if not the default
                user.timezone = timezone
                db.commit()
        
        # Create session - store the session_id for logging
        session_id = session_manager.create_session(user.id, response)
        
        # Create redirect response with timezone param for frontend to detect changes
        success_path = f"{FRONTEND_SUCCESS_PATH}?timezone_updated={user.timezone}"
        redirect = RedirectResponse(url=f"{FRONTEND_URL}{success_path}")
        
        # Copy all cookies from the original response to the redirect
        for key, value in response.headers.items():
            if key.lower() == 'set-cookie':
                redirect.headers[key] = value

        print(f"Created session {session_id} for user {user.id}")
        print(f"Redirect URL: {FRONTEND_URL}{success_path}")
        print(f"Cookie headers: {redirect.headers.get('set-cookie')}")
        
        # Test Redis connection
        test_key = f"test:connection:{user.id}"
        session_manager.redis_client.setex(test_key, 60, "test")
        redis_result = session_manager.redis_client.get(test_key)
        print(f"Redis test result: {redis_result}")
        
        return redirect
    
    except Exception as e:
        # Log dat
        print(f"Google auth error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}{FRONTEND_ERROR_PATH}")