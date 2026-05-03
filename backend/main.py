import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

# routers import
from backend.routers import chat, quiz, news, forms, users, gamification

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civicguide.vercel.app",
]

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="CivicGuide AI - Backend")
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

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(gamification.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/elections")
async def upcoming_elections():
    # Mock upcoming Indian elections data
    return {
        "elections": [
            {"name": "Maharashtra Assembly", "state": "Maharashtra", "phases": 2, "start_date": "2026-10-12", "end_date": "2026-10-20", "seats": 288},
            {"name": "Jharkhand Assembly", "state": "Jharkhand", "phases": 1, "start_date": "2026-11-05", "end_date": "2026-11-05", "seats": 81},
            {"name": "Haryana Assembly", "state": "Haryana", "phases": 1, "start_date": "2026-09-20", "end_date": "2026-09-20", "seats": 90},
            {"name": "Uttarakhand Assembly", "state": "Uttarakhand", "phases": 1, "start_date": "2026-09-28", "end_date": "2026-09-28", "seats": 70},
            {"name": "Punjab Assembly", "state": "Punjab", "phases": 1, "start_date": "2026-10-04", "end_date": "2026-10-04", "seats": 117},
        ]
    }
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

from routers import chat, quiz, news, forms, users

# Initialize FastAPI app
app = FastAPI(
    title="CivicGuide AI API",
    description="API for CivicGuide AI - Learn about Indian Elections & Civic Engagement",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(forms.router, prefix="/api/forms", tags=["forms"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
