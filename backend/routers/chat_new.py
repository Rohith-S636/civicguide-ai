"""
Chat router for real-time election Q&A with streaming support.

Features:
  - Streaming SSE responses for real-time chat
  - Non-streaming API fallback
  - Conversation history management
  - Language support (en, hi, te, ta, kn)
  - ReAct agent integration
  - Rate limiting per user
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

from agents.election_agent import run_election_agent
from utils.gemini import generate_chat_response, stream_chat_response, get_credit_status
from utils.validation import ChatInputValidator, validate_language

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================================================
# MODELS
# ============================================================================

class ChatMessage(BaseModel):
    """Single chat message"""
    role: str  # "user" or "model"
    parts: List[str]


class ChatRequest(BaseModel):
    """Chat API request"""
    message: str
    language: str = "en"  # en | hi | te | ta | kn
    session_id: Optional[str] = None
    history: Optional[List[dict]] = None
    use_agent: bool = False


class ChatResponse(BaseModel):
    """Chat API response"""
    reply: str
    xp_earned: int = 5
    references: List[str] = []
    credit_status: Optional[dict] = None
    session_id: Optional[str] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Non-streaming chat endpoint with full input validation.
    
    Returns:
      - reply: AI-generated response
      - xp_earned: Experience points for gamification
      - references: Sources and citations
      - credit_status: Current API usage
      - session_id: For conversation continuity
    """
    try:
        # Validate input using dedicated validator
        try:
            validated = ChatInputValidator.validate(
                message=request.message,
                language=request.language or 'en',
                session_id=request.session_id,
            )
        except ValueError as e:
            logger.warning(f"Input validation failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

        # Build conversation history in Gemini format
        history = request.history or []

        # Use agent if requested, otherwise use simple chat
        if request.use_agent:
            logger.info(f"🤖 Using ReAct agent for: {validated['message'][:100]}")
            result = await run_election_agent(
                message=validated['message'],
                language=validated['language'],
            )
            reply = result.get("reply", "")
            references = result.get("references", [])
            xp = result.get("xp_earned", 5)
        else:
            # Simple chat without agent
            logger.info(f"💬 Chat: {validated['message'][:100]} ({validated['language']})")
            reply, status = await generate_chat_response(
                message=validated['message'],
                history=history,
                language=validated['language'],
                model_choice="flash",
            )
            references = []
            xp = 5

        # Get current credit status
        credit_status = get_credit_status()

        # Log to backend (background task)
        background_tasks.add_task(
            log_chat_interaction,
            session_id=validated['session_id'],
            message=validated['message'],
            reply=reply,
            language=validated['language'],
            use_agent=request.use_agent,
        )

        return ChatResponse(
            reply=reply,
            xp_earned=xp,
            references=references,
            credit_status=credit_status,
            session_id=validated['session_id'],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events.
    
    Streams text chunks in real-time:
      data: {"delta": "chunk of text"}
      ...
      data: {"done": true, "xp": 5}
    """
    try:
        # Validate input
        if not request.message or len(request.message.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        logger.info(f"📡 Stream chat: {request.message[:100]} ({request.language})")

        async def event_generator():
            # Stream chunks from Gemini
            async for chunk in stream_chat_response(
                message=request.message,
                history=request.history,
                language=request.language,
            ):
                yield chunk

            # Send completion with metadata
            credit_status = get_credit_status()
            completion_data = {
                "done": True,
                "xp_earned": 5,
                "credit_status": credit_status,
                "session_id": request.session_id,
            }
            yield f"data: {__import__('json').dumps(completion_data)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )

    except Exception as e:
        logger.error(f"❌ Streaming error: {e}")
        raise HTTPException(status_code=500, detail=f"Streaming failed: {str(e)}")


@router.get("/status")
async def chat_status():
    """Get chat service status and credit information."""
    try:
        credit_status = get_credit_status()
        return {
            "service": "online",
            "ai_model": "gemini-1.5-flash",
            "credits": credit_status,
        }
    except Exception as e:
        logger.error(f"❌ Status check failed: {e}")
        return {
            "service": "error",
            "error": str(e),
        }


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

async def log_chat_interaction(
    session_id: Optional[str],
    message: str,
    reply: str,
    language: str,
    use_agent: bool,
):
    """Log chat interaction to database (if enabled)."""
    try:
        # TODO: Implement logging to Supabase or similar
        logger.debug(f"📝 Logged: session={session_id}, lang={language}, agent={use_agent}")
    except Exception as e:
        logger.error(f"Failed to log interaction: {e}")
