from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
import secrets
from .routes.grades import router as grades_router
from .routes.auth import router as auth_router

app = FastAPI(title="Grade Calculator API")

# Generate a random secret key for session middleware
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))

# Add SessionMiddleware - required for OAuth
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grades_router, prefix="/api/grades", tags=["grades"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Grade Calculator API is running"}