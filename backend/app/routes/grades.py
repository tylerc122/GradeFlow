from fastapi import APIRouter, HTTPException, Request, Body, Header, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
import json
from datetime import datetime

from ..database.database import get_db
from ..database.models import SavedCalculation, Category, User
from ..models.grade_models import Assignment
from ..services.grade_parser import parse_blackboard_grades
from ..auth.session_manager import session_manager

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
        assignments = await parse_blackboard_grades(raw_data, available_categories)
        
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
    
@router.post("/save")
async def save_calculation(
    request: Request,
    calculation_data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create new saved calculation
        new_calculation = SavedCalculation(
            user_id=user_id,
            name=calculation_data.get("name", "Unnamed Calculation"),
            raw_data=calculation_data.get("raw_data", ""),
            results={
                "overall_grade": calculation_data.get("overall_grade", 0),
                "total_points_earned": calculation_data.get("total_points_earned", 0),
                "total_points_possible": calculation_data.get("total_points_possible", 0)
            }
        )
        
        db.add(new_calculation)
        db.flush()  # Get the ID without committing
        
        # Add categories
        for cat_data in calculation_data.get("categories", []):
            category = Category(
                calculation_id=new_calculation.id,
                name=cat_data.get("name", ""),
                weight=cat_data.get("weight", 0),
                assignments=cat_data.get("assignments", [])
            )
            db.add(category)
        
        db.commit()
        db.refresh(new_calculation)
        
        return JSONResponse({
            "id": new_calculation.id,
            "message": "Calculation saved successfully"
        })
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save calculation: {str(e)}"
        )

@router.get("/saved")
async def get_saved_calculations(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get all saved calculations for user with their categories
        calculations = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id
        ).all()
        
        # Format response
        response = []
        for calc in calculations:
            calc_data = {
                "id": calc.id,
                "name": calc.name,
                "created_at": calc.created_at,
                "results": calc.results,
                "categories": [
                    {
                        "name": cat.name,
                        "weight": cat.weight,
                        "assignments": cat.assignments
                    }
                    for cat in calc.categories
                ]
            }
            response.append(calc_data)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve calculations: {str(e)}"
        )

@router.get("/{calculation_id}")
async def get_calculation(
    calculation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get specific calculation with authentication check
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="Calculation not found or unauthorized"
            )
        
        # Format response
        response = {
            "id": calculation.id,
            "name": calculation.name,
            "created_at": calculation.created_at,
            "raw_data": calculation.raw_data,
            "results": calculation.results,
            "categories": [
                {
                    "name": cat.name,
                    "weight": cat.weight,
                    "assignments": cat.assignments
                }
                for cat in calculation.categories
            ]
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve calculation: {str(e)}"
        )
    
@router.delete("/{calculation_id}")
async def delete_calculation(
    calculation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Find calculation and verify ownership
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="Calculation not found or unauthorized"
            )
        
        # Delete categories first (due to foreign key constraint)
        db.query(Category).filter(
            Category.calculation_id == calculation_id
        ).delete()
        
        # Delete calculation
        db.delete(calculation)
        db.commit()
        
        return {"message": "Calculation deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete calculation: {str(e)}"
        )
    
@router.put("/{calculation_id}")
async def update_calculation(
    calculation_id: int,
    calculation_data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        print(f"Updating calculation {calculation_id} with data:", calculation_data)
        
        # Find calculation and verify ownership
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="Calculation not found or unauthorized"
            )
        
        # Update calculation fields
        calculation.name = calculation_data.get("name", calculation.name)
        calculation.raw_data = calculation_data.get("raw_data", calculation.raw_data)
        calculation.results = calculation_data.get("results", calculation.results)
        
        # Delete existing categories
        db.query(Category).filter(
            Category.calculation_id == calculation_id
        ).delete()
        
        db.flush()  # Ensure deletion is processed
        
        # Create new categories
        for cat_data in calculation_data.get("categories", []):
            category = Category(
                calculation_id=calculation_id,
                name=cat_data["name"],
                weight=cat_data["weight"],
                assignments=cat_data["assignments"]
            )
            db.add(category)
        
        try:
            db.commit()
        except Exception as commit_error:
            print(f"Commit error: {commit_error}")
            db.rollback()
            raise
            
        db.refresh(calculation)
        
        # Return the complete updated calculation
        return {
            "id": calculation.id,
            "name": calculation.name,
            "raw_data": calculation.raw_data,
            "results": calculation.results,
            "categories": [
                {
                    "name": cat.name,
                    "weight": cat.weight,
                    "assignments": cat.assignments
                }
                for cat in calculation.categories
            ]
        }
        
    except Exception as e:
        print(f"Error updating calculation: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update calculation: {str(e)}"
        )