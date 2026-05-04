import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from routers import chat, forms, news, quiz, users
from routers.gamification import router as gamification_router
from utils.gemini import get_credit_status

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civicguide-ai.vercel.app",
    os.getenv("FRONTEND_URL", "https://civicguide-ai.vercel.app"),
]

limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CivicGuide AI backend starting")
    logger.info("AI provider: Google Gemini (%s)", os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    logger.info("Environment: %s", os.getenv("ENVIRONMENT", "development"))
    if os.getenv("GOOGLE_API_KEY"):
        logger.info("Google Gemini API key configured")
    else:
        logger.warning("GOOGLE_API_KEY not set - Gemini features will be unavailable")

    yield

    logger.info("CivicGuide AI backend shutting down")


app = FastAPI(
    title="CivicGuide AI Backend",
    description="API for Indian Election Education & Civic Engagement",
    version="0.1.0",
    docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",
    openapi_url=None if os.getenv("ENVIRONMENT") == "production" else "/openapi.json",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(gamification_router)


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "ai_provider": "Google Gemini",
        "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "api_configured": bool(os.getenv("GOOGLE_API_KEY")),
    }


@app.get("/api/credit-status")
async def api_credit_status() -> dict[str, object]:
    try:
        return {"success": True, "data": get_credit_status()}
    except Exception as exc:
        logger.exception("Failed to read credit status")
        return {"success": False, "error": str(exc)}


@app.get("/api/elections")
async def upcoming_elections() -> dict[str, object]:
    return {
        "elections": [
            {
                "name": "Maharashtra Assembly",
                "state": "Maharashtra",
                "phases": 2,
                "start_date": "2026-10-12",
                "end_date": "2026-10-20",
                "seats": 288,
            },
            {
                "name": "Haryana Assembly",
                "state": "Haryana",
                "phases": 1,
                "start_date": "2026-09-20",
                "end_date": "2026-09-20",
                "seats": 90,
            },
            {
                "name": "Uttarakhand Assembly",
                "state": "Uttarakhand",
                "phases": 1,
                "start_date": "2026-09-28",
                "end_date": "2026-09-28",
                "seats": 70,
            },
            {
                "name": "Punjab Assembly",
                "state": "Punjab",
                "phases": 1,
                "start_date": "2026-10-04",
                "end_date": "2026-10-04",
                "seats": 117,
            },
        ]
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
