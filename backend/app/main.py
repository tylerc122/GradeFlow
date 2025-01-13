from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.grades import router as grades_router
from .routes.auth import router as auth_router

app = FastAPI(title="Grade Calculator API")

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