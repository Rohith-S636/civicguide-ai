from fastapi import APIRouter, HTTPException
from typing import Any
from utils.supabase import get_user_progress, upsert_user_progress
from models.schemas import UserProgress

router = APIRouter()


@router.get("/{user_id}/progress", response_model=UserProgress)
async def get_progress(user_id: str):
    data = await get_user_progress(user_id)
    if not data:
        raise HTTPException(status_code=404, detail='User not found')
    # Ensure it matches UserProgress, but allow flexible fields
    return UserProgress(**data)


@router.post("/{user_id}/progress", response_model=Any)
async def update_progress(user_id: str, payload: dict):
    res = await upsert_user_progress(user_id, payload)
    return res
from fastapi import APIRouter, HTTPException
from models.schemas import UserProfile, UserUpdate
from typing import List

router = APIRouter()

@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str):
    """
    Get user profile information
    """
    try:
        # Implementation will retrieve from Supabase
        return UserProfile(
            id=user_id,
            email="",
            username="",
            xp=0,
            badges=[],
            level=1,
            created_at=None,
            updated_at=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile", response_model=UserProfile)
async def update_profile(user_id: str, request: UserUpdate):
    """
    Update user profile
    """
    try:
        # Implementation will update in Supabase
        return UserProfile(
            id=user_id,
            email="",
            username="",
            xp=0,
            badges=[],
            level=1,
            created_at=None,
            updated_at=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard", response_model=List[UserProfile])
async def get_leaderboard(limit: int = 10):
    """
    Get top users by XP
    """
    try:
        # Implementation will query leaderboard from database
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
