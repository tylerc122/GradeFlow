from fastapi import APIRouter, HTTPException, Request, Body
from fastapi.responses import JSONResponse
from ..models.grade_models import Assignment
from ..services.grade_parser import parse_blackboard_grades

router = APIRouter()

@router.post("/calculate/raw", 
    status_code=200,
    description="Calculate grades from raw Blackboard data",
    responses={
        200: {
            "description": "Successful grade calculation",
            "content": {
                "application/json": {
                    "example": {
                        "assignments": [],
                        "overall_grade": 0,
                        "total_points_earned": 0,
                        "total_points_possible": 0
                    }
                }
            }
        }
    })
async def calculate_grades_raw(
    raw_data: str = Body(..., media_type="text/plain", description="Raw Blackboard grade data")
):
    try:
        # Process the grades
        assignments = parse_blackboard_grades(raw_data)
        
        # Calculate total points and overall grade
        total_points_earned = sum(a.score for a in assignments)
        total_points_possible = sum(a.total_points for a in assignments if a.status == "GRADED")
        overall_grade = (total_points_earned / total_points_possible * 100) if total_points_possible > 0 else 0
        
        return JSONResponse({
            "assignments": [a.dict() for a in assignments],
            "overall_grade": overall_grade,
            "total_points_earned": total_points_earned,
            "total_points_possible": total_points_possible
        })
    except Exception as e:
        print("Error processing grades:", str(e))  # Debug logging
        raise HTTPException(status_code=400, detail=str(e))