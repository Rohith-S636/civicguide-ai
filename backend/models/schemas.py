from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# ============================================================================
# CHAT MODELS
# ============================================================================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="user|model")
    content: str


class ChatRequest(BaseModel):
    """Chat API request"""
    message: str
    language: Optional[str] = Field(default='en', description="en|hi|te|ta|kn")
    session_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Chat API response"""
    reply: str
    xp_earned: int = 0
    references: List[str] = Field(default_factory=list)
    credit_status: Optional[dict] = None
    session_id: Optional[str] = None


# ============================================================================
# QUIZ MODELS
# ============================================================================

class QuizRequest(BaseModel):
    """Quiz generation request"""
    topic: Optional[str] = None
    difficulty: Optional[str] = Field(default='beginner', description="beginner|student|exam")
    language: Optional[str] = Field(default='en', description="en|hi|te|ta|kn")
    count: Optional[int] = Field(default=10, ge=1, le=50)


class QuizQuestion(BaseModel):
    """Quiz question"""
    question: str
    options: List[str]
    correct_index: int
    explanation: Optional[str] = None
    category: Optional[str] = None


class QuizScore(BaseModel):
    """Quiz score record"""
    quiz_id: Optional[str] = None
    score: int
    date: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None


# ============================================================================
# NEWS MODELS
# ============================================================================

class NewsItem(BaseModel):
    """News article"""
    title: str
    summary: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None


# ============================================================================
# FORMS MODELS
# ============================================================================

class FormInfo(BaseModel):
    """Government form information"""
    form_id: str
    name: str
    purpose: Optional[str] = None
    url: Optional[str] = None
    procedure_steps: List[str] = Field(default_factory=list)
    required_docs: List[str] = Field(default_factory=list)


# ============================================================================
# USER MODELS
# ============================================================================

class UserProfile(BaseModel):
    """User profile"""
    id: str
    email: str
    username: str
    xp: int = 0
    level: int = 1
    badges: List[str] = Field(default_factory=list)
    language: str = "en"
    streak: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    """User profile update"""
    username: Optional[str] = None
    email: Optional[str] = None
    language: Optional[str] = None


class UserProgress(BaseModel):
    """User progress and gamification data"""
    user_id: str
    xp: int = 0
    level: int = 1
    badges: List[str] = Field(default_factory=list)
    quiz_scores: List[QuizScore] = Field(default_factory=list)
    streak: int = 0
    last_active: Optional[datetime] = None

    sources: Optional[List[str]] = None
    timestamp: datetime

# Quiz Models
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: str

class QuizRequest(BaseModel):
    topic: str
    difficulty: str
    num_questions: int = 5

class QuestionAnswer(BaseModel):
    question_id: str
    selected_answer: str
    user_id: Optional[str] = None

# News Models
class NewsArticle(BaseModel):
    title: str
    description: str
    url: str
    source: str
    published_date: datetime
    summary: Optional[str] = None

# User Models
class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    xp: int
    badges: List[str]
    level: int
    created_at: datetime
    updated_at: datetime

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
