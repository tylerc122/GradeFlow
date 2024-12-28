from fastapi import APIRouter, HTTPException, Request, Body, Header
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
from ..models.grade_models import Assignment
from ..services.grade_parser import parse_blackboard_grades

router = APIRouter()

@router.post("/calculate/raw", 
    status_code=200,
    description="Calculate grades from raw Blackboard data")
async def calculate_grades_raw(
    request: Request,
    raw_data: str = Body(..., media_type="text/plain"),
    x_grade_categories: Optional[str] = Header(None)
):
    try:
        # Parse categories from header if present
        available_categories = None
        if x_grade_categories:
            try:
                available_categories = json.loads(x_grade_categories)
                print("Received categories:", available_categories)
            except json.JSONDecodeError:
                print("Error decoding categories header")
        
        # Process the grades with available categories
        assignments = parse_blackboard_grades(raw_data, available_categories)
        
        if not assignments:
            raise HTTPException(
                status_code=400, 
                detail="No valid assignments could be parsed from the input data"
            )
        
        # Calculate totals
        total_points_earned = sum(a.score for a in assignments if a.status == "GRADED")
        total_points_possible = sum(a.total_points for a in assignments if a.status == "GRADED")
        overall_grade = (total_points_earned / total_points_possible * 100) if total_points_possible > 0 else 0
        
        # Log processing results
        print(f"Successfully processed {len(assignments)} assignments")
        print(f"Total points earned: {total_points_earned}")
        print(f"Total points possible: {total_points_possible}")
        print(f"Overall grade: {overall_grade}%")
        
        return JSONResponse({
            "assignments": [a.dict() for a in assignments],
            "overall_grade": overall_grade,
            "total_points_earned": total_points_earned,
            "total_points_possible": total_points_possible
        })
        
    except Exception as e:
        print("Error processing grades:", str(e))
        raise HTTPException(status_code=400, detail=str(e))