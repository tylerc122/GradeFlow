from typing import Optional
import redis
from fastapi import HTTPException, Request, Response
from passlib.context import CryptContext
import secrets
from datetime import timedelta
import time
import os

class RateLimiter:
    """Rate limiter using Redis as a backend"""
    
    def __init__(self, redis_client):
        self.redis_client = redis_client
        
    def is_rate_limited(self, key: str, max_requests: int, period: int) -> bool:
        """
        Check if request should be rate limited
        
        Args:
            key: Unique identifier (IP address, API key, etc)
            max_requests: Maximum number of requests allowed in period
            period: Time period in seconds
            
        Returns:
            bool: True if request should be rate limited, False otherwise
        """
        try:
            current = int(time.time())
            key = f"ratelimit:{key}:{current // period}"
            
            # Increment counter for this time window
            count = self.redis_client.incr(key)
            
            # Set expiration if this is the first request in the window
            if count == 1:
                self.redis_client.expire(key, period)
                
            # Check if limit exceeded
            return count > max_requests
        except Exception as e:
            # Log the error but don't rate limit the request if Redis fails
            print(f"Rate limiting failed: {e}")
            return False  # Allow the request to proceed
        
    def limit_request(self, request: Request, max_requests: int = 100, period: int = 60):
        """
        Rate limit a request based on client IP
        
        Args:
            request: FastAPI request object
            max_requests: Maximum requests allowed in period
            period: Time period in seconds
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        try:
            # Get client IP from request
            client_ip = request.client.host
            
            if self.is_rate_limited(client_ip, max_requests, period):
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests"
                )
            
            return True
        except Exception as e:
            # If there's any error in rate limiting, log it and allow the request
            if not isinstance(e, HTTPException):  # Don't catch our own HTTPException
                print(f"Error in rate limiting: {e}")
                return True
            raise  # Re-raise HTTPExceptions (like 429)

class SessionManager:
    def __init__(self):
        # Get Redis connection details from environment variables
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        redis_password = os.getenv("REDIS_PASSWORD", None)
        # Connect to Redis with improved error handling
        try:
            self.redis_client = redis.Redis(
                host=redis_host, 
                port=redis_port, 
                db=redis_db, 
                password=redis_password,
                decode_responses=True,
                socket_timeout=5,            # Add timeout parameters
                socket_connect_timeout=5,
                retry_on_timeout=True,       # Enable retries
                health_check_interval=30,    # Regular health checks
                max_connections=10           # Limit connection pool
            )
            # Test connection
            self.redis_client.ping()
            print(f"Successfully connected to Redis at {redis_host}:{redis_port}")
        except Exception as e:
            print(f"WARNING: Redis connection failed: {e}")
            # Create a dummy Redis client for development/testing
            # that won't crash the app if Redis is unavailable
            from fakeredis import FakeRedis
            self.redis_client = FakeRedis(decode_responses=True)
            print("Using FakeRedis as fallback")

        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.session_duration = timedelta(days=7)  # Sessions last 7 days
        self.rate_limiter = RateLimiter(self.redis_client)
        
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