"""
Controls user routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Body, Request, Response
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import User, SavedCalculation
from ..auth.session_manager import session_manager
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class DeleteAccountFeedback(BaseModel):
    feedback: Optional[str] = None

@router.get("/me")
async def get_current_user(
    user_id: int = Depends(session_manager.require_auth),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "profile_picture": user.profile_picture,
            "timezone": user.timezone
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/timezone")
async def update_timezone(
    timezone: str = Body(..., embed=True),
    user_id: int = Depends(session_manager.require_auth),
    db: Session = Depends(get_db)
):
    """Update the user's timezone preference"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.timezone = timezone
        db.commit()
        
        return {"message": "Timezone updated successfully", "timezone": timezone}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update timezone: {str(e)}")

@router.delete("/me")
async def delete_account(
    request: Request,
    response: Response,
    feedback_data: Optional[DeleteAccountFeedback] = None,
    user_id: int = Depends(session_manager.require_auth),
    db: Session = Depends(get_db)
):
    """Deletes the user account and all associated data."""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if feedback_data and feedback_data.feedback:
            print(f"User {user_id} ({user.email}) deleted account with feedback: {feedback_data.feedback}")

        db.query(SavedCalculation).filter(SavedCalculation.user_id == user_id).delete()

        db.delete(user)
        db.commit()

        session_manager.end_session(request, response)

        return {"message": "Account deleted successfully"}

    except Exception as e:
        db.rollback()
        print(f"Error deleting account for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}") 