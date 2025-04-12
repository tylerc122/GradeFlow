"""
Controls user routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import User
from ..auth.session_manager import session_manager

router = APIRouter()

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