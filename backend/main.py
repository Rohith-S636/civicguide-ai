import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# routers import
from backend.routers import chat, quiz, news, forms, users, gamification
from backend.utils.gemini import get_credit_status, get_credit_manager

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civicguide.vercel.app",
]

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CivicGuide AI - Backend",
    description="API for CivicGuide AI - Learn about Indian Elections & Civic Engagement",
    version="0.1.0"
)
    # Configure CORS origins
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://civicguide-ai.vercel.app",
        os.getenv("FRONTEND_URL", "https://civicguide-ai.vercel.app"),
    ]

    # Configure rate limiter
    limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

    # Lifespan context
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup
        logger.info("🚀 CivicGuide AI Backend Starting...")
        logger.info(f"📊 AI Provider: Google Gemini (model: {os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')})")
        logger.info(f"🗄️  Environment: {os.getenv('ENVIRONMENT', 'development')}")
        if os.getenv("GOOGLE_API_KEY"):
            logger.info("✅ Google Gemini API Key configured")
        else:
            logger.warning("⚠️  GOOGLE_API_KEY not set - Gemini features will not work")
    
        yield
    
        # Shutdown
        logger.info("🛑 Shutting down CivicGuide AI Backend")

    # Initialize FastAPI app
    app = FastAPI(
        title="CivicGuide AI Backend",
        description="API for Indian Election Education & Civic Engagement",
        version="0.1.0",
        docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",
        openapi_url=None if os.getenv("ENVIRONMENT") == "production" else "/openapi.json",
        lifespan=lifespan
    )
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add CORS middleware with detailed configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(gamification.router)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "ai_provider": "Google Gemini"}


@app.get("/api/credit-status")
async def get_api_credit_status():
    """Get current Gemini API credit status"""
    try:
        status = get_credit_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/elections")
async def upcoming_elections():
    """Get upcoming Indian elections data"""
    return {
        "elections": [
            {"name": "Maharashtra Assembly", "state": "Maharashtra", "phases": 2, "start_date": "2026-10-12", "end_date": "2026-10-20", "seats": 288},
    return {
        "status": "ok",
        "ai_provider": "Google Gemini",
        "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "api_configured": bool(os.getenv("GOOGLE_API_KEY"))
    }
            {"name": "Haryana Assembly", "state": "Haryana", "phases": 1, "start_date": "2026-09-20", "end_date": "2026-09-20", "seats": 90},
            {"name": "Uttarakhand Assembly", "state": "Uttarakhand", "phases": 1, "start_date": "2026-09-28", "end_date": "2026-09-28", "seats": 70},
            {"name": "Punjab Assembly", "state": "Punjab", "phases": 1, "start_date": "2026-10-04", "end_date": "2026-10-04", "seats": 117},
        ]
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTPException handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
