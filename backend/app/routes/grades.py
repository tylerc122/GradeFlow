"""
Controls grade routes.
"""
from fastapi import APIRouter, HTTPException, Request, Body, Header, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import json
from datetime import datetime
from datetime import timedelta
import time

from ..database.database import get_db
from ..database.models import SavedCalculation, Category, User
from ..models.grade_models import Assignment
from ..services.grade_parser import parse_blackboard_grades
from ..services.openai_integration import OpenAICategorizer
from ..services.shared_services import openai_categorizer
from ..auth.session_manager import session_manager
from ..utils.timezone_utils import convert_utc_to_timezone, format_datetime_for_response

router = APIRouter()

# Helper function to get user's timezone
def get_user_timezone(db: Session, user_id: int) -> str:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "UTC"
    return user.timezone or "UTC"

@router.post("/calculate/raw", 
    status_code=200,
    description="Calculate grades from raw Blackboard data")
async def calculate_grades_raw(
    request: Request,
    raw_data: str = Body(..., media_type="text/plain"),
    x_grade_categories: Optional[str] = Header(None)
):
    try:
        # Log cache statistics before processing
        cache_stats_before = openai_categorizer.get_cache_stats()
        
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
        
        # Log cache statistics after processing to see if cache was used
        cache_stats_after = openai_categorizer.get_cache_stats()
        print(f"OpenAI Cache Stats - Before: {cache_stats_before}")
        print(f"OpenAI Cache Stats - After: {cache_stats_after}")
        
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
                "total_points_possible": calculation_data.get("total_points_possible", 0),
                "calculation_mode": calculation_data.get("calculation_mode", "blackboard"),
                "manual_grades": calculation_data.get("manualGrades", [])
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

@router.post("/gpa/save")
async def save_gpa_calculation(
    request: Request,
    gpa_data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create new saved GPA calculation
        new_calculation = SavedCalculation(
            user_id=user_id,
            name=gpa_data.get("name", "Unnamed GPA"),
            raw_data="", # GPA doesn't use raw data like regular calculations
            results={
                "calculation_type": "gpa",
                "overall_gpa": gpa_data.get("overallGPA", "0.00"),
                "major_gpa": gpa_data.get("majorGPA", "0.00"),
                "courses": gpa_data.get("courses", []),
                "major_courses": gpa_data.get("majorCourses", [])
            }
        )
        
        db.add(new_calculation)
        db.commit()
        db.refresh(new_calculation)
        
        return JSONResponse({
            "id": new_calculation.id,
            "message": "GPA calculation saved successfully"
        })
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save GPA calculation: {str(e)}"
        )

@router.get("/gpa/saved")
async def get_saved_gpa_calculations(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Get all saved calculations for the user
        all_calculations = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id
        ).all()
        
        # Filter for GPA calculations in Python
        calculations = [calc for calc in all_calculations 
                      if calc.results and 
                         calc.results.get('calculation_type') == 'gpa']
        
        # Format response
        response = []
        for calc in calculations:
            calc_data = {
                "id": calc.id,
                "name": calc.name,
                "created_at": format_datetime_for_response(calc.created_at, timezone_str),
                "overallGPA": calc.results.get("overall_gpa", "0.00"),
                "majorGPA": calc.results.get("major_gpa", "0.00"),
                "courses": calc.results.get("courses", []),
                "majorCourses": calc.results.get("major_courses", [])
            }
            response.append(calc_data)
        
        return response
        
    except Exception as e:
        print(f"Error fetching GPA calculations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve GPA calculations: {str(e)}"
        )
        
@router.get("/gpa/{calculation_id}")
async def get_gpa_calculation(
    calculation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Get specific calculation with authentication check
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="GPA calculation not found or unauthorized"
            )
            
        # Verify it's a GPA calculation
        if not calculation.results or calculation.results.get('calculation_type') != 'gpa':
            raise HTTPException(
                status_code=404,
                detail="Not a valid GPA calculation"
            )
        
        # Format response
        response = {
            "id": calculation.id,
            "name": calculation.name,
            "created_at": format_datetime_for_response(calculation.created_at, timezone_str),
            "overallGPA": calculation.results.get("overall_gpa", "0.00"),
            "majorGPA": calculation.results.get("major_gpa", "0.00"),
            "courses": calculation.results.get("courses", []),
            "majorCourses": calculation.results.get("major_courses", [])
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving GPA calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve GPA calculation: {str(e)}"
        )

@router.put("/gpa/{calculation_id}")
async def update_gpa_calculation(
    calculation_id: int,
    request: Request,
    gpa_data: dict = Body(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get the existing calculation with authentication check
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="GPA calculation not found or unauthorized"
            )
            
        # Verify it's a GPA calculation
        if not calculation.results or calculation.results.get('calculation_type') != 'gpa':
            raise HTTPException(
                status_code=404,
                detail="Not a valid GPA calculation"
            )
        
        # Update the calculation
        calculation.name = gpa_data.get("name", calculation.name)
        calculation.results = {
            "calculation_type": "gpa",
            "overall_gpa": gpa_data.get("overallGPA", "0.00"),
            "major_gpa": gpa_data.get("majorGPA", "0.00"),
            "courses": gpa_data.get("courses", []),
            "major_courses": gpa_data.get("majorCourses", [])
        }
        
        db.commit()
        db.refresh(calculation)
        
        return JSONResponse({
            "id": calculation.id,
            "message": "GPA calculation updated successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating GPA calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update GPA calculation: {str(e)}"
        )
        
@router.delete("/gpa/{calculation_id}")
async def delete_gpa_calculation(
    calculation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Find the calculation
        calculation = db.query(SavedCalculation).filter(
            SavedCalculation.id == calculation_id,
            SavedCalculation.user_id == user_id
        ).first()
        
        if not calculation:
            raise HTTPException(
                status_code=404,
                detail="GPA calculation not found or unauthorized"
            )
            
        # Verify it's a GPA calculation
        if not calculation.results or calculation.results.get('calculation_type') != 'gpa':
            raise HTTPException(
                status_code=404,
                detail="Not a valid GPA calculation"
            )
        
        # Delete the calculation
        db.delete(calculation)
        db.commit()
        
        return JSONResponse({
            "message": "GPA calculation deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting GPA calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete GPA calculation: {str(e)}"
        )

@router.get("/saved")
async def get_saved_calculations(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Get all saved calculations for user with their categories
        all_calculations = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id
        ).all()
        
        # Filter out GPA calculations
        calculations = [calc for calc in all_calculations 
                       if not (calc.results and calc.results.get('calculation_type') == 'gpa')]
        
        # Format response
        response = []
        for calc in calculations:
            calc_data = {
                "id": calc.id,
                "name": calc.name,
                "created_at": format_datetime_for_response(calc.created_at, timezone_str),
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
        print(f"Error fetching regular calculations: {str(e)}")
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
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
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
            "created_at": format_datetime_for_response(calculation.created_at, timezone_str),
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
    
@router.get("/dashboard/stats")
async def get_dashboard_stats(
    request: Request,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Get all regular calculations for user (excluding GPAs)
        all_calculations = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id
        ).order_by(desc(SavedCalculation.created_at)).all()
        
        # Filter out GPA calculations
        calculations = [calc for calc in all_calculations 
                      if not (calc.results and calc.results.get('calculation_type') == 'gpa')]
        
        if not calculations:
            return {
                "latest_grade": None,
                "average_grade": None,
                "total_assignments": 0,
                "grade_history": [],
                "category_averages": {}
            }
            
        # Calculate statistics
        total_grades = 0
        total_assignments = 0
        grade_history = []
        category_averages = {}
        category_counts = {}
        
        for calc in calculations:
            # Add to grade history with timezone conversion
            grade_history.append({
                "date": format_datetime_for_response(calc.created_at, timezone_str),
                "grade": calc.results.get("overall_grade", 0)
            })
            
            # Add to total for average
            total_grades += calc.results.get("overall_grade", 0)
            
            # Process categories
            for category in calc.categories:
                total_assignments += len(category.assignments)
                
                # Track category averages
                if category.name not in category_averages:
                    category_averages[category.name] = 0
                    category_counts[category.name] = 0
                    
                # Calculate category grade
                earned = sum(float(a.get("score", 0)) for a in category.assignments)
                possible = sum(float(a.get("total_points", 0)) for a in category.assignments)
                if possible > 0:
                    category_grade = (earned / possible) * 100
                    category_averages[category.name] += category_grade
                    category_counts[category.name] += 1
        
        # Calculate final averages
        average_grade = total_grades / len(calculations) if calculations else 0
        
        for category in category_averages:
            if category_counts[category] > 0:
                category_averages[category] /= category_counts[category]
        
        # Get latest calculation details
        latest = calculations[0] if calculations else None
        latest_grade = latest.results.get("overall_grade", 0) if latest else None
        
        return {
            "latest_grade": latest_grade,
            "average_grade": average_grade,
            "total_assignments": total_assignments,
            "grade_history": grade_history,
            "category_averages": category_averages
        }
        
    except Exception as e:
        print(f"Error fetching dashboard statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dashboard statistics: {str(e)}"
        )
    
@router.get("/dashboard/recent")
async def get_recent_calculations(
    request: Request,
    limit: int = 3,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Get all calculations for the user
        all_calcs = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id
        ).order_by(desc(SavedCalculation.created_at)).all()
        
        # Filter out GPA calculations
        regular_calcs = [calc for calc in all_calcs 
                      if not (calc.results and calc.results.get('calculation_type') == 'gpa')]
        
        # Limit to requested number
        recent_calcs = regular_calcs[:limit] if len(regular_calcs) > limit else regular_calcs
        
        # Format response
        response = []
        for calc in recent_calcs:
            calc_data = {
                "id": calc.id,
                "name": calc.name,
                "created_at": format_datetime_for_response(calc.created_at, timezone_str),
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
        print(f"Error fetching recent calculations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent calculations: {str(e)}"
        )
    
@router.get("/dashboard/trends")
async def get_grade_trends(
    request: Request,
    days: int = 30,
    db: Session = Depends(get_db),
    user_id: int = Depends(session_manager.require_auth)
):
    try:
        # Get user's timezone
        timezone_str = get_user_timezone(db, user_id)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all calculations within date range
        all_calculations = db.query(SavedCalculation).filter(
            SavedCalculation.user_id == user_id,
            SavedCalculation.created_at >= start_date,
            SavedCalculation.created_at <= end_date
        ).order_by(SavedCalculation.created_at).all()
        
        # Filter out GPA calculations
        calculations = [calc for calc in all_calculations 
                      if not (calc.results and calc.results.get('calculation_type') == 'gpa')]
        
        # Track grades over time
        grade_trends = []
        category_trends = {}
        
        for calc in calculations:
            # Overall grade trend with timezone conversion
            grade_trends.append({
                "date": format_datetime_for_response(calc.created_at, timezone_str),
                "grade": calc.results.get("overall_grade", 0)
            })
            
            # Category-specific trends
            for category in calc.categories:
                if category.name not in category_trends:
                    category_trends[category.name] = []
                    
                earned = sum(float(a.get("score", 0)) for a in category.assignments)
                possible = sum(float(a.get("total_points", 0)) for a in category.assignments)
                category_grade = (earned / possible * 100) if possible > 0 else 0
                
                category_trends[category.name].append({
                    "date": format_datetime_for_response(calc.created_at, timezone_str),
                    "grade": category_grade
                })
        
        return {
            "overall_trend": grade_trends,
            "category_trends": category_trends
        }
        
    except Exception as e:
        print(f"Error fetching grade trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch grade trends: {str(e)}"
        )

@router.get("/api/cache/stats")
async def get_cache_stats(
    request: Request,
    user_id: int = Depends(session_manager.require_auth)  # Use regular auth instead of admin
):
    """Get statistics about the OpenAI categorization cache."""
    try:
        stats = openai_categorizer.get_cache_stats()
        return JSONResponse({
            "cache_stats": stats,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve cache statistics: {str(e)}"
        )

@router.post("/api/cache/clear")
async def clear_cache(
    request: Request,
    user_id: int = Depends(session_manager.require_auth)  # Use regular auth instead of admin
):
    """Clear the OpenAI categorization cache."""
    try:
        openai_categorizer.clear_cache()
        return JSONResponse({
            "message": "Cache cleared successfully",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear cache: {str(e)}"
        )

@router.post("/api/test/categorization")
async def test_categorization(
    request: Request,
    body: dict = Body(...),
    user_id: int = Depends(session_manager.require_auth)
):
    """Test endpoint to validate memoization by running the same categorization request twice"""
    try:
        # Get test data from request
        test_assignments = body.get("assignments", [])
        test_categories = body.get("categories", [])
        
        if not test_assignments or not test_categories:
            return JSONResponse({
                "error": "Please provide both assignments and categories for testing"
            }, status_code=400)
            
        # First call - should be a cache miss
        start_time = time.time()
        results1 = await openai_categorizer.suggest_categories_batch(
            test_assignments, 
            test_categories
        )
        first_call_time = time.time() - start_time
        
        # Second call with identical inputs - should be a cache hit
        start_time = time.time()
        results2 = await openai_categorizer.suggest_categories_batch(
            test_assignments, 
            test_categories
        )
        second_call_time = time.time() - start_time
        
        # Get cache statistics
        cache_stats = openai_categorizer.get_cache_stats()
        
        return JSONResponse({
            "first_call_time": first_call_time,
            "second_call_time": second_call_time,
            "speedup_factor": first_call_time / second_call_time if second_call_time > 0 else "infinity",
            "results_identical": results1 == results2,
            "cache_stats": cache_stats,
            "results": {
                "first_call": results1,
                "second_call": results2
            }
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error testing categorization: {str(e)}"
        )
