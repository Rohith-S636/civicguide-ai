from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Dict, Any, Optional
import json

from backend.models.schemas import QuizRequest, QuizQuestion
from backend.agents.quiz_agent import QuizAgent
from backend.utils.supabase import upsert_user_progress

router = APIRouter()


@router.get("/generate")
async def generate_quiz_endpoint(
    topic: str = Query(..., description="Quiz topic"),
    difficulty: str = Query('beginner', description="beginner|student|exam"),
    language: str = Query('en', description="en|hi|te|ta"),
    count: int = Query(10, description="Number of questions", ge=1, le=50),
) -> Dict[str, Any]:
    """
    Generate quiz questions.
    
    Topics: general_election, constitution, voting_process, current_affairs, state_elections, eci_history
    Difficulties: beginner, student, exam
    Languages: en, hi, te, ta
    """
    try:
        agent = QuizAgent()
        result = await agent.generate_questions(
            topic=topic,
            difficulty=difficulty,
            language=language,
            count=count,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")


@router.get("/categories")
async def get_quiz_categories() -> Dict[str, Any]:
    """
    Get all available quiz categories.
    """
    agent = QuizAgent()
    categories = agent.get_categories()
    return {
        "categories": categories,
        "total": len(categories),
    }


@router.post("/submit")
async def submit_quiz_score(
    user_id: str = Query(...),
    topic: str = Query(...),
    difficulty: str = Query(...),
    score: int = Query(..., ge=0, le=100),
    total_questions: int = Query(..., ge=1),
    xp_earned: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """
    Submit quiz score and save to Supabase.
    
    Returns: Updated user progress and XP awarded.
    """
    try:
        # Calculate XP if not provided
        if xp_earned == 0:
            score_percent = (score / total_questions) * 100
            base_xp = int((score / total_questions) * 50)  # 50 XP per perfect score
            difficulty_multiplier = {"beginner": 1.0, "student": 1.5, "exam": 2.0}
            xp_earned = int(base_xp * difficulty_multiplier.get(difficulty, 1.0))

        # Build quiz attempt record
        attempt = {
            "topic": topic,
            "difficulty": difficulty,
            "score": score,
            "total_questions": total_questions,
            "percentage": (score / total_questions) * 100,
            "xp_earned": xp_earned,
        }

        # Prepare payload for Supabase
        payload = {
            "last_quiz": attempt,
            "xp": xp_earned,  # Will be added to existing in Supabase
        }

        # Save to Supabase
        result = await upsert_user_progress(user_id, payload)

        return {
            "success": True,
            "xp_awarded": xp_earned,
            "message": f"Quiz submitted successfully! You earned {xp_earned} XP.",
            "user_progress": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

    Submit answer to a quiz question
    """
    try:
        # Implementation will validate answer and update user XP
        return {"correct": True, "explanation": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
