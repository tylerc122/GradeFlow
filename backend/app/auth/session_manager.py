from typing import Optional
import redis
from fastapi import HTTPException, Request, Response
from passlib.context import CryptContext
import secrets
from datetime import timedelta

class SessionManager:
    def __init__(self):
        # Connect to Redis
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.session_duration = timedelta(days=7)  # Sessions last 7 days
        
    def create_session(self, user_id: int, response: Response) -> str:
        """Create a new session for a user"""
        session_id = secrets.token_urlsafe(32)
        
        # Store session in Redis with expiration
        self.redis_client.setex(
            f"session:{session_id}",
            self.session_duration,
            str(user_id)
        )
        
        # Set cookie in response
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,  # Prevent JavaScript access
            secure=True,    # Only send over HTTPS
            samesite="lax", # CSRF protection
            max_age=int(self.session_duration.total_seconds())
        )
        
        return session_id
    
    def get_user_id(self, request: Request) -> Optional[int]:
        """Get user ID from session"""
        session_id = request.cookies.get("session_id")
        if not session_id:
            return None
            
        user_id = self.redis_client.get(f"session:{session_id}")
        return int(user_id) if user_id else None
    
    def end_session(self, request: Request, response: Response):
        """End a user session"""
        session_id = request.cookies.get("session_id")
        if session_id:
            # Delete from Redis
            self.redis_client.delete(f"session:{session_id}")
            # Delete cookie
            response.delete_cookie(key="session_id")
            
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def require_auth(self, request: Request):
        """Dependency for protected routes"""
        user_id = self.get_user_id(request)
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Not authenticated"
            )
        return user_id

# Create a global session manager instance
session_manager = SessionManager()