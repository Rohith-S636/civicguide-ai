from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from utils.supabase import get_user_progress, upsert_user_progress

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class UserProfile(BaseModel):
    """User profile schema"""
    id: str
    email: str
    username: str
    xp: int = 0
    level: int = 1
    badges: List[str] = []
    language: str = "en"
    streak: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    """User profile update schema"""
    username: Optional[str] = None
    language: Optional[str] = None
    email: Optional[str] = None


class UserProgress(BaseModel):
    """User progress schema"""
    user_id: str
    xp: int = 0
    level: int = 1
    badges: List[str] = []
    streak: int = 0
    last_active: Optional[datetime] = None


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    rank: int
    username: str
    xp: int
    level: int
    badges_count: int


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str = Query(..., description="User ID")) -> UserProfile:
    """
    Get user profile information
    
    Args:
        user_id: The user's unique identifier
        
    Returns:
        UserProfile with all user data
    """
    try:
        progress = await get_user_progress(user_id)
        if not progress:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserProfile(
            id=user_id,
            email=progress.get("email", ""),
            username=progress.get("username", ""),
            xp=progress.get("xp", 0),
            level=progress.get("level", 1),
            badges=progress.get("badges", []),
            language=progress.get("language", "en"),
            streak=progress.get("streak", 0),
            created_at=progress.get("created_at"),
            updated_at=progress.get("updated_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")


@router.put("/profile", response_model=UserProfile)
async def update_profile(user_id: str = Query(...), request: UserUpdate = None) -> UserProfile:
    """
    Update user profile
    
    Args:
        user_id: The user's unique identifier
        request: Updated profile data
        
    Returns:
        Updated UserProfile
    """
    try:
        if not request:
            raise HTTPException(status_code=400, detail="Request body required")
        
        # Build update payload (only include provided fields)
        update_data = {}
        if request.username:
            update_data["username"] = request.username
        if request.language:
            update_data["language"] = request.language
        if request.email:
            update_data["email"] = request.email
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await upsert_user_progress(user_id, update_data)
        
        return UserProfile(
            id=user_id,
            email=result.get("email", ""),
            username=result.get("username", ""),
            xp=result.get("xp", 0),
            level=result.get("level", 1),
            badges=result.get("badges", []),
            language=result.get("language", "en"),
            streak=result.get("streak", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@router.get("/{user_id}/progress", response_model=UserProgress)
async def get_progress(user_id: str) -> UserProgress:
    """
    Get user progress and gamification stats
    
    Args:
        user_id: The user's unique identifier
        
    Returns:
        UserProgress with XP, level, badges, and streak
    """
    try:
        data = await get_user_progress(user_id)
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserProgress(
            user_id=user_id,
            xp=data.get("xp", 0),
            level=data.get("level", 1),
            badges=data.get("badges", []),
            streak=data.get("streak", 0),
            last_active=data.get("last_active"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress: {str(e)}")


@router.put("/{user_id}/progress", response_model=UserProgress)
async def update_progress(user_id: str, payload: dict) -> UserProgress:
    """
    Update user progress
    
    Args:
        user_id: The user's unique identifier
        payload: Progress update data
        
    Returns:
        Updated UserProgress
    """
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Request body required")
        
        result = await upsert_user_progress(user_id, payload)
        
        return UserProgress(
            user_id=user_id,
            xp=result.get("xp", 0),
            level=result.get("level", 1),
            badges=result.get("badges", []),
            streak=result.get("streak", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = Query(10, ge=1, le=100, description="Number of entries")) -> List[LeaderboardEntry]:
    """
    Get top users by XP
    
    Args:
        limit: Number of leaderboard entries to return
        
    Returns:
        List of LeaderboardEntry objects sorted by XP descending
    """
    try:
        # TODO: Implement actual leaderboard query from Supabase
        # For now returning mock data structure
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leaderboard: {str(e)}")

