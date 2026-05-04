# ============================================================================
# GAMIFICATION ROUTER
# ============================================================================

from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from utils.gamification import (
    calculate_xp_for_quiz,
    calculate_level_from_xp,
    check_badge_unlocks,
    calculate_streak,
    XPActivityType,
    XP_RULES,
)

# ============================================================================
# MODELS
# ============================================================================


class XPGainRequest(BaseModel):
    """Request to add XP for an activity"""
    user_id: str
    activity_type: str  # XPActivityType value
    amount: Optional[int] = None  # For custom XP amounts
    metadata: Optional[dict] = None  # Additional context (quiz_id, etc.)


class XPGainResponse(BaseModel):
    """Response with XP gain and badge unlocks"""
    xp_gained: int
    new_total_xp: int
    new_level: int
    badges_unlocked: List[str]
    level_up: bool


class QuizSubmissionRequest(BaseModel):
    """Quiz submission for XP calculation"""
    user_id: str
    topic: str
    difficulty: str
    score: int
    total_questions: int
    language: Optional[str] = "en"


class QuizSubmissionResponse(BaseModel):
    """Response with quiz XP and stats"""
    xp_gained: int
    bonuses_applied: List[str]
    new_total_xp: int
    new_level: int
    badges_unlocked: List[str]


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    rank: int
    username: str
    xp: int
    level: int
    badges_count: int


class LeaderboardResponse(BaseModel):
    """Leaderboard response"""
    entries: List[LeaderboardEntry]
    total_users: int
    user_rank: Optional[LeaderboardEntry] = None


# ============================================================================
# MOCK DATA (Replace with Supabase queries)
# ============================================================================

# Temporary in-memory storage for demo
USER_XP_DATA = {}
USER_BADGES = {}
USER_STATS = {}


def get_or_create_user(user_id: str):
    """Get or create user XP/badge data"""
    if user_id not in USER_XP_DATA:
        USER_XP_DATA[user_id] = 0
        USER_BADGES[user_id] = []
        USER_STATS[user_id] = {
            "total_questions_asked": 0,
            "total_quizzes": 0,
            "perfect_quizzes": 0,
            "blogs_read": 0,
            "articles_read": 0,
            "forms_viewed": [],
            "flashcard_sets_completed": 0,
            "languages_used": set(),
            "current_streak": 0,
            "total_logins": 0,
            "total_shares": 0,
            "total_xp": 0,
        }
    return USER_XP_DATA[user_id], USER_BADGES[user_id], USER_STATS[user_id]


# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter(prefix="/api/gamification", tags=["gamification"])


@router.post("/xp/add", response_model=XPGainResponse)
async def add_xp(request: XPGainRequest) -> XPGainResponse:
    """
    Add XP for a completed activity.

    Args:
        request: XPGainRequest with user_id, activity_type, and optional amount

    Returns:
        XPGainResponse with new XP, level, and badge unlocks
    """
    current_xp, badges, stats = get_or_create_user(request.user_id)

    # Determine XP amount
    if request.amount:
        xp_gained = request.amount
    else:
        xp_gained = XP_RULES.get(request.activity_type, 0)

    new_total_xp = current_xp + xp_gained
    old_level = calculate_level_from_xp(current_xp)
    new_level = calculate_level_from_xp(new_total_xp)
    level_up = new_level > old_level

    # Update user data
    USER_XP_DATA[request.user_id] = new_total_xp
    stats["total_xp"] = new_total_xp

    # Check for badge unlocks
    newly_unlocked = check_badge_unlocks(
        request.user_id,
        badges,
        stats,
        request.activity_type,
    )

    # Update badges
    for badge in newly_unlocked:
        if badge not in badges:
            badges.append(badge)

    return XPGainResponse(
        xp_gained=xp_gained,
        new_total_xp=new_total_xp,
        new_level=new_level,
        badges_unlocked=newly_unlocked,
        level_up=level_up,
    )


@router.post("/quiz/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(request: QuizSubmissionRequest) -> QuizSubmissionResponse:
    """
    Submit quiz results and calculate XP.

    Args:
        request: QuizSubmissionRequest with quiz details

    Returns:
        QuizSubmissionResponse with XP gained and badge unlocks
    """
    current_xp, badges, stats = get_or_create_user(request.user_id)

    # Calculate XP
    base_xp, bonuses = calculate_xp_for_quiz(
        correct_answers=request.score,
        total_questions=request.total_questions,
        difficulty=request.difficulty,
    )

    # Update stats
    stats["total_quizzes"] += 1
    if request.score == request.total_questions:
        stats["perfect_quizzes"] += 1

    if request.language:
        if isinstance(stats.get("languages_used"), set):
            stats["languages_used"].add(request.language)
        else:
            stats["languages_used"] = {request.language}

    new_total_xp = current_xp + base_xp
    new_level = calculate_level_from_xp(new_total_xp)

    # Update user data
    USER_XP_DATA[request.user_id] = new_total_xp
    stats["total_xp"] = new_total_xp

    # Check for badge unlocks
    newly_unlocked = check_badge_unlocks(
        request.user_id,
        badges,
        stats,
        XPActivityType.QUIZ_CORRECT_ANSWER,
    )

    # Update badges
    for badge in newly_unlocked:
        if badge not in badges:
            badges.append(badge)

    return QuizSubmissionResponse(
        xp_gained=base_xp,
        bonuses_applied=bonuses,
        new_total_xp=new_total_xp,
        new_level=new_level,
        badges_unlocked=newly_unlocked,
    )


@router.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """Get user's gamification profile."""
    current_xp, badges, stats = get_or_create_user(user_id)
    level = calculate_level_from_xp(current_xp)

    return {
        "user_id": user_id,
        "xp": current_xp,
        "level": level,
        "badges": badges,
        "stats": {
            k: v if not isinstance(v, set) else list(v)
            for k, v in stats.items()
        },
    }


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: Optional[str] = None,
) -> LeaderboardResponse:
    """
    Get global leaderboard.

    Args:
        limit: Number of entries (1-100, default 10)
        offset: Pagination offset
        user_id: Optional user ID to find their rank

    Returns:
        LeaderboardResponse with sorted entries and user rank
    """
    # Create leaderboard entries from all users
    entries = []
    for uid, xp in USER_XP_DATA.items():
        level = calculate_level_from_xp(xp)
        badge_count = len(USER_BADGES.get(uid, []))
        entries.append({
            "user_id": uid,
            "xp": xp,
            "level": level,
            "badges_count": badge_count,
        })

    # Sort by XP descending
    entries.sort(key=lambda x: x["xp"], reverse=True)

    # Add rank
    ranked_entries = [
        LeaderboardEntry(
            rank=idx + 1,
            username=entry["user_id"],
            xp=entry["xp"],
            level=entry["level"],
            badges_count=entry["badges_count"],
        )
        for idx, entry in enumerate(entries)
    ]

    # Find user rank
    user_rank = None
    if user_id:
        user_entry = next(
            (e for e in ranked_entries if e.username == user_id),
            None,
        )
        user_rank = user_entry

    # Apply pagination
    paginated = ranked_entries[offset : offset + limit]

    return LeaderboardResponse(
        entries=paginated,
        total_users=len(ranked_entries),
        user_rank=user_rank,
    )


@router.post("/streak/update")
async def update_streak(
    user_id: str,
    last_login_date: Optional[datetime] = None,
):
    """Update user's login streak."""
    _, _, stats = get_or_create_user(user_id)

    new_streak, logged_in_today = calculate_streak(
        last_login_date,
        datetime.utcnow(),
        stats.get("current_streak", 0),
    )

    stats["current_streak"] = new_streak
    stats["total_logins"] = stats.get("total_logins", 0) + (1 if not logged_in_today else 0)

    # Award daily login XP if not already claimed today
    if not logged_in_today:
        xp_response = await add_xp(
            XPGainRequest(
                user_id=user_id,
                activity_type=XPActivityType.DAILY_LOGIN,
            )
        )
        return {
            "streak": new_streak,
            "xp_gained": xp_response.xp_gained,
            "logged_in_today": logged_in_today,
        }

    return {
        "streak": new_streak,
        "xp_gained": 0,
        "logged_in_today": logged_in_today,
    }


@router.post("/badge/track")
async def track_activity(
    user_id: str,
    activity: str,
    metadata: Optional[dict] = None,
):
    """
    Track user activities for badge unlock conditions.

    Args:
        user_id: User ID
        activity: Activity type (read_blog, view_form, share_result, etc.)
        metadata: Activity metadata (form_id, blog_id, etc.)
    """
    _, badges, stats = get_or_create_user(user_id)

    # Track different activities
    if activity == "read_blog":
        stats["articles_read"] = stats.get("articles_read", 0) + 1
        stats["blogs_read"] = stats.get("blogs_read", 0) + 1

    elif activity == "view_form":
        form_id = metadata.get("form_id") if metadata else None
        if form_id and form_id not in stats.get("forms_viewed", []):
            if "forms_viewed" not in stats:
                stats["forms_viewed"] = []
            stats["forms_viewed"].append(form_id)

    elif activity == "share_result":
        stats["total_shares"] = stats.get("total_shares", 0) + 1
        stats["has_shared_result"] = True

    elif activity == "ask_question":
        stats["total_questions_asked"] = stats.get("total_questions_asked", 0) + 1

    # Check for newly unlocked badges
    newly_unlocked = check_badge_unlocks(
        user_id,
        badges,
        stats,
        XPActivityType.CHAT_QUESTION,
    )

    # Update badges
    for badge in newly_unlocked:
        if badge not in badges:
            badges.append(badge)

    return {
        "activity": activity,
        "new_badges": newly_unlocked,
        "stats": {
            k: v if not isinstance(v, set) else list(v)
            for k, v in stats.items()
        },
    }


@router.get("/badges/all")
async def get_all_badges():
    """Get all available badges."""
    from backend.lib.gamification.badges import BADGES  # Import your badges file

    return {
        "total": len(BADGES),
        "badges": BADGES,
    }
