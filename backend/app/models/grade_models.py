from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class GradeCalculationRequest(BaseModel):
    raw_text: str

    @field_validator('raw_text')
    def clean_text(cls, v):
        # Normalize newlines and clean the input
        return v.replace('\r\n', '\n').replace('\r', '\n')

class Assignment(BaseModel):
    name: str
    assignment_type: Optional[str] = None
    date_graded: Optional[datetime] = None
    status: str
    score: float
    total_points: float
    suggested_category: Optional[str] = None
    category_confidence: Optional[float] = None
    match_reasons: Optional[list[str]] = None

class GradeCalculationResponse(BaseModel):
    assignments: list[Assignment]
    overall_grade: float
    total_points_earned: float
    total_points_possible: float