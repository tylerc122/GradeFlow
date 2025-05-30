"""
Main entry point for the API.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
import secrets
from .routes.grades import router as grades_router
from .routes.auth import router as auth_router
from .routes.users import router as users_router
from .auth.session_manager import session_manager
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse
import subprocess
import sys

# Run database migrations at startup
def run_migrations():
    try:
        print("Running database migrations...")
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("Migrations completed successfully")
    except Exception as e:
        print(f"Error running migrations: {e}", file=sys.stderr)
        # Don't fail app startup if migrations fail

# Run migrations
run_migrations()

# block requests to hidden files/directories
class BlockDotFilesMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith('/.'):
            return PlainTextResponse("Forbidden", status_code=403)
        response = await call_next(request)
        return response

# Rate limiting middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for certain paths if needed
        # path = request.url.path
        # if path == "/some-public-endpoint":
        #     return await call_next(request)
        
        # Default limits: 100 requests per minute
        session_manager.rate_limiter.limit_request(request)
        
        # Continue processing the request
        response = await call_next(request)
        return response

app = FastAPI(title="Grade Calculator API")

# Generate a random secret key for session middleware
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))

# Add Middleware to block dot files/directories
app.add_middleware(BlockDotFilesMiddleware)

# Add SessionMiddleware - required for OAuth
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.gradeflow.org",
        "https://gradeflow.org",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

app.include_router(grades_router, prefix="/api/grades", tags=["grades"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Grade Calculator API is running"}

@app.get("/api/test-cors")
async def test_cors():
    return {"message": "CORS is configured correctly"}