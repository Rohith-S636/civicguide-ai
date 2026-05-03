# ============================================================================
# GAMIFICATION BACKEND UTILITIES
# ============================================================================

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum


class XPActivityType(str, Enum):
    """XP activity types matching frontend"""
    CHAT_QUESTION = "chat_question"  # +5 XP
    QUIZ_CORRECT_ANSWER = "quiz_correct_answer"  # +10 XP per answer
    SIMULATION_COMPLETE = "simulation_complete"  # +50 XP
    BLOG_READ = "blog_read"  # +5 XP
    FLASHCARD_SET_COMPLETE = "flashcard_set_complete"  # +15 XP
    DAILY_LOGIN = "daily_login"  # +10 XP
    FIRST_QUESTION_BONUS = "first_question_bonus"  # +20 XP
    PERFECT_QUIZ_BONUS = "perfect_quiz_bonus"  # +30 XP


XP_RULES = {
    XPActivityType.CHAT_QUESTION: 5,
    XPActivityType.QUIZ_CORRECT_ANSWER: 10,
    XPActivityType.SIMULATION_COMPLETE: 50,
    XPActivityType.BLOG_READ: 5,
    XPActivityType.FLASHCARD_SET_COMPLETE: 15,
    XPActivityType.DAILY_LOGIN: 10,
    XPActivityType.FIRST_QUESTION_BONUS: 20,
    XPActivityType.PERFECT_QUIZ_BONUS: 30,
}

LEVEL_THRESHOLDS = {
    1: 0,
    2: 300,
    3: 600,
    4: 1000,
    5: 1500,
    6: 2200,
    7: 3000,
    8: 4000,
    9: 5200,
    10: 6500,
}

DIFFICULTY_MULTIPLIERS = {
    "beginner": 1.0,
    "student": 1.5,
    "exam": 2.0,
}


class BadgeType(str, Enum):
    """Badge types matching frontend"""
    FIRST_VOICE = "first_vote"
    QUIZ_MASTER = "quiz_master"
    POLYGLOT = "polyglot"
    SIMULATION_STAR = "simulation_star"
    CONSTITUTION_GURU = "constitution_guru"
    NEWS_HAWK = "news_hawk"
    FORM_EXPERT = "form_expert"
    FLASHCARD_ENTHUSIAST = "flashcard_enthusiast"
    BLOG_READER = "blog_reader"
    STREAK_7 = "streak_7"
    STREAK_30 = "streak_30"
    DAILY_VOTER = "daily_voter"
    SOCIAL_VOTER = "social_voter"
    INFLUENCER = "influencer"
    EARLY_BIRD = "early_bird"
    NIGHT_OWL = "night_owl"
    KNOWLEDGE_SEEKER = "knowledge_seeker"
    DEMOCRACY_CHAMPION = "democracy_champion"
    CIVIC_LEGEND = "civic_legend"
    PERFECT_STUDENT = "perfect_student"


# ============================================================================
# XP CALCULATION FUNCTIONS
# ============================================================================


def calculate_xp_for_quiz(
    correct_answers: int,
    total_questions: int,
    difficulty: str = "beginner",
) -> Tuple[int, List[str]]:
    """
    Calculate total XP for a completed quiz.

    Args:
        correct_answers: Number of correct answers
        total_questions: Total questions in quiz
        difficulty: Quiz difficulty (beginner, student, exam)

    Returns:
        Tuple of (total_xp, bonus_reasons)
    """
    base_xp = correct_answers * XP_RULES[XPActivityType.QUIZ_CORRECT_ANSWER]
    multiplier = DIFFICULTY_MULTIPLIERS.get(difficulty, 1.0)
    total_xp = int(base_xp * multiplier)
    bonuses = []

    # Perfect score bonus
    if correct_answers == total_questions:
        total_xp += XP_RULES[XPActivityType.PERFECT_QUIZ_BONUS]
        bonuses.append(XPActivityType.PERFECT_QUIZ_BONUS)

    return total_xp, bonuses


def calculate_level_from_xp(xp: int) -> int:
    """Calculate level based on XP."""
    for level in range(10, 0, -1):
        if xp >= LEVEL_THRESHOLDS[level]:
            return level
    return 1


def calculate_xp_for_next_level(current_xp: int) -> int:
    """Calculate XP needed to reach next level."""
    current_level = calculate_level_from_xp(current_xp)
    if current_level >= 10:
        return 0
    next_threshold = LEVEL_THRESHOLDS[current_level + 1]
    return max(0, next_threshold - current_xp)


def calculate_level_progress(current_xp: int) -> float:
    """Calculate progress percentage towards next level (0-100)."""
    current_level = calculate_level_from_xp(current_xp)
    if current_level >= 10:
        return 100.0

    current_threshold = LEVEL_THRESHOLDS[current_level]
    next_threshold = LEVEL_THRESHOLDS[current_level + 1]
    progress = ((current_xp - current_threshold) / (next_threshold - current_threshold)) * 100
    return max(0, min(100, progress))


# ============================================================================
# BADGE UNLOCK LOGIC
# ============================================================================


def check_badge_unlocks(
    user_id: str,
    current_badges: List[str],
    user_stats: Dict,
    activity_type: XPActivityType,
) -> List[str]:
    """
    Check if user unlocked any badges based on current activity and stats.

    Args:
        user_id: User ID
        current_badges: List of already unlocked badge IDs
        user_stats: Dict with user statistics (xp, quiz_count, questions_asked, etc.)
        activity_type: Type of activity just completed

    Returns:
        List of newly unlocked badge IDs
    """
    newly_unlocked = []

    # First Voice - Ask first question
    if (
        activity_type == XPActivityType.CHAT_QUESTION
        and BadgeType.FIRST_VOICE not in current_badges
        and user_stats.get("total_questions_asked", 0) == 1
    ):
        newly_unlocked.append(BadgeType.FIRST_VOICE)

    # Quiz Master - Perfect score
    if (
        activity_type == XPActivityType.PERFECT_QUIZ_BONUS
        and BadgeType.QUIZ_MASTER not in current_badges
    ):
        newly_unlocked.append(BadgeType.QUIZ_MASTER)

    # Perfect Student - 5 perfect quizzes
    if (
        activity_type == XPActivityType.PERFECT_QUIZ_BONUS
        and BadgeType.PERFECT_STUDENT not in current_badges
        and user_stats.get("perfect_quizzes", 0) >= 5
    ):
        newly_unlocked.append(BadgeType.PERFECT_STUDENT)

    # Simulation Star - Complete simulation
    if (
        activity_type == XPActivityType.SIMULATION_COMPLETE
        and BadgeType.SIMULATION_STAR not in current_badges
    ):
        newly_unlocked.append(BadgeType.SIMULATION_STAR)

    # Blog Reader - Read all blogs
    if (
        activity_type == XPActivityType.BLOG_READ
        and BadgeType.BLOG_READER not in current_badges
        and user_stats.get("blogs_read", 0) >= 10
    ):
        newly_unlocked.append(BadgeType.BLOG_READER)

    # News Hawk - Read 5 articles
    if (
        activity_type == XPActivityType.BLOG_READ
        and BadgeType.NEWS_HAWK not in current_badges
        and user_stats.get("articles_read", 0) >= 5
    ):
        newly_unlocked.append(BadgeType.NEWS_HAWK)

    # Form Expert - View 5 forms
    if BadgeType.FORM_EXPERT not in current_badges and user_stats.get("forms_viewed", 0) >= 5:
        newly_unlocked.append(BadgeType.FORM_EXPERT)

    # Flashcard Enthusiast - Complete 10 sets
    if (
        activity_type == XPActivityType.FLASHCARD_SET_COMPLETE
        and BadgeType.FLASHCARD_ENTHUSIAST not in current_badges
        and user_stats.get("flashcard_sets_completed", 0) >= 10
    ):
        newly_unlocked.append(BadgeType.FLASHCARD_ENTHUSIAST)

    # Polyglot - Use 3 languages
    if BadgeType.POLYGLOT not in current_badges and user_stats.get("languages_used", 0) >= 3:
        newly_unlocked.append(BadgeType.POLYGLOT)

    # Streak badges
    streak = user_stats.get("current_streak", 0)
    if streak >= 7 and BadgeType.STREAK_7 not in current_badges:
        newly_unlocked.append(BadgeType.STREAK_7)

    if streak >= 30 and BadgeType.STREAK_30 not in current_badges:
        newly_unlocked.append(BadgeType.STREAK_30)

    # Daily Voter - 100 logins
    if (
        activity_type == XPActivityType.DAILY_LOGIN
        and BadgeType.DAILY_VOTER not in current_badges
        and user_stats.get("total_logins", 0) >= 100
    ):
        newly_unlocked.append(BadgeType.DAILY_VOTER)

    # Early Bird & Night Owl - check login time
    login_time = user_stats.get("login_time")  # datetime object
    if login_time:
        hour = login_time.hour
        if hour < 8 and BadgeType.EARLY_BIRD not in current_badges:
            newly_unlocked.append(BadgeType.EARLY_BIRD)
        if hour >= 22 and BadgeType.NIGHT_OWL not in current_badges:
            newly_unlocked.append(BadgeType.NIGHT_OWL)

    # Social Voter - Share result
    if (
        user_stats.get("has_shared_result")
        and BadgeType.SOCIAL_VOTER not in current_badges
    ):
        newly_unlocked.append(BadgeType.SOCIAL_VOTER)

    # Influencer - 5 shares
    if (
        user_stats.get("total_shares", 0) >= 5
        and BadgeType.INFLUENCER not in current_badges
    ):
        newly_unlocked.append(BadgeType.INFLUENCER)

    # Knowledge Seeker - 1000 XP
    if (
        user_stats.get("total_xp", 0) >= 1000
        and BadgeType.KNOWLEDGE_SEEKER not in current_badges
    ):
        newly_unlocked.append(BadgeType.KNOWLEDGE_SEEKER)

    # Democracy Champion - Level 8
    level = calculate_level_from_xp(user_stats.get("total_xp", 0))
    if level >= 8 and BadgeType.DEMOCRACY_CHAMPION not in current_badges:
        newly_unlocked.append(BadgeType.DEMOCRACY_CHAMPION)

    # Civic Legend - Level 10
    if level >= 10 and BadgeType.CIVIC_LEGEND not in current_badges:
        newly_unlocked.append(BadgeType.CIVIC_LEGEND)

    # Constitution Guru - Perfect score on constitution quiz
    if (
        user_stats.get("perfect_constitution_quiz")
        and BadgeType.CONSTITUTION_GURU not in current_badges
    ):
        newly_unlocked.append(BadgeType.CONSTITUTION_GURU)

    return list(set(newly_unlocked))  # Remove duplicates


# ============================================================================
# STREAK CALCULATION
# ============================================================================


def calculate_streak(
    last_login_date: Optional[datetime],
    current_date: Optional[datetime] = None,
    previous_streak: int = 0,
) -> Tuple[int, bool]:
    """
    Calculate current streak.

    Args:
        last_login_date: Last login datetime
        current_date: Current datetime (defaults to now)
        previous_streak: Previous streak count

    Returns:
        Tuple of (current_streak, has_logged_in_today)
    """
    if current_date is None:
        current_date = datetime.utcnow()

    if last_login_date is None:
        return (0, False)

    # Normalize to date only (ignore time)
    last_date = last_login_date.date()
    current_date_only = current_date.date()

    # Check if logged in today
    if last_date == current_date_only:
        return (previous_streak, True)

    # Check if streak is still alive (logged in yesterday)
    yesterday = current_date_only - timedelta(days=1)
    if last_date == yesterday:
        return (previous_streak + 1, False)

    # Streak broken
    return (0, False)


# ============================================================================
# LEADERBOARD
# ============================================================================


def calculate_leaderboard_entry(user_xp: int, user_level: int, badges_count: int) -> Dict:
    """Create a leaderboard entry with all necessary stats."""
    return {
        "xp": user_xp,
        "level": user_level,
        "badges_count": badges_count,
        "level_progress": calculate_level_progress(user_xp),
        "xp_to_next_level": calculate_xp_for_next_level(user_xp),
    }
