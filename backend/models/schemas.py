from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="user|ai")
    content: str


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = Field('en')
    session_id: Optional[str]
    history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    xp_earned: int = 0
    references: List[str] = Field(default_factory=list)


class QuizRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[str] = Field('beginner')
    language: Optional[str] = Field('en')
    count: Optional[int] = Field(10, ge=1, le=50)


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: Optional[str] = None
    category: Optional[str] = None


class NewsItem(BaseModel):
    title: str
    summary: Optional[str]
    date: Optional[str]
    source: Optional[str]
    url: Optional[str]
    category: Optional[str]


class FormInfo(BaseModel):
    form_id: str
    name: str
    purpose: Optional[str]
    url: Optional[str]
    procedure_steps: List[str] = Field(default_factory=list)
    required_docs: List[str] = Field(default_factory=list)


class QuizScore(BaseModel):
    quiz_id: Optional[str]
    score: int
    date: Optional[str]


class UserProgress(BaseModel):
    user_id: str
    xp: int = 0
    level: Optional[int] = 1
    badges: List[str] = Field(default_factory=list)
    quiz_scores: List[QuizScore] = Field(default_factory=list)
    streak: Optional[int] = 0
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Chat Models
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
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
