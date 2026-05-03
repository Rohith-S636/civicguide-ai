from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from slowapi.util import get_remote_address
from slowapi import Limiter
import json
import asyncio
from typing import List, Optional

from backend.models.schemas import ChatRequest, ChatResponse
from backend.agents.election_agent import ElectionAgent

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/", response_model=ChatResponse)
@limiter.limit("15/minute")
async def chat_stream(req: ChatRequest, request: Request):
    """Run the ElectionAgent and stream response via Server-Sent Events (SSE).

    The agent saves progress to Supabase internally. Returns final XP in the last SSE event.
    """
    agent = ElectionAgent()

    # run agent to get full reply (we will stream it in chunks)
    reply, xp, refs = await agent.answer(req.message, session_id=req.session_id, language=req.language, history=[m for m in (req.history or [])])

    async def event_generator():
        # stream reply in small chunks
        chunk_size = 250
        for i in range(0, len(reply), chunk_size):
            chunk = reply[i:i+chunk_size]
            payload = {"type": "chunk", "text": chunk}
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(0.02)

        # final event with metadata
        final = {"type": "done", "xp_earned": xp, "references": refs}
        yield f"data: {json.dumps(final)}\n\n"

    return StreamingResponse(event_generator(), media_type='text/event-stream')
