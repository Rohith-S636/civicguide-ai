"""
Google Gemini AI utilities with credit management and expiration tracking
"""
import os
import asyncio
import json
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
import logging

try:
    import google.generativeai as genai
    from google.generativeai.types import GenerateContentResponse
except Exception as e:
    genai = None
    GenerateContentResponse = None
    logging.warning(f"Google Generative AI SDK not installed: {e}")

# Configure logging
logger = logging.getLogger(__name__)

# Credit management constants
GEMINI_FREE_TIER_LIMIT = 60 * 1000  # 60 requests per minute limit (roughly 1M tokens/month free)
GEMINI_RESET_SCHEDULE = "monthly"  # Resets on 1st of each month at 00:00 UTC
CREDIT_WARNING_THRESHOLD = 0.8  # Warn at 80% usage


class CreditManager:
    """Manages Gemini API credit tracking and expiration"""

    def __init__(self, storage_path: str = "/tmp/gemini_credits.json"):
        self.storage_path = storage_path
        self.credits_data = self._load_credits()

    def _load_credits(self) -> dict:
        """Load credit data from storage"""
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load credits data: {e}")
        
        return {
            "monthly_requests": 0,
            "monthly_tokens": 0,
            "current_month": datetime.utcnow().strftime("%Y-%m"),
            "reset_date": self._get_next_reset_date(),
            "last_request": None,
            "last_error": None,
        }

    def _save_credits(self):
        """Save credit data to storage"""
        try:
            # Create directory if needed
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
            with open(self.storage_path, 'w') as f:
                json.dump(self.credits_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save credits data: {e}")

    def _get_next_reset_date(self) -> str:
        """Get the next reset date (1st of next month)"""
        now = datetime.utcnow()
        if now.month == 12:
            next_reset = datetime(now.year + 1, 1, 1)
        else:
            next_reset = datetime(now.year, now.month + 1, 1)
        return next_reset.strftime("%Y-%m-%d %H:%M:%S UTC")

    def _check_reset_month(self):
        """Check if month has changed and reset if needed"""
        current_month = datetime.utcnow().strftime("%Y-%m")
        if self.credits_data.get("current_month") != current_month:
            self.credits_data["monthly_requests"] = 0
            self.credits_data["monthly_tokens"] = 0
            self.credits_data["current_month"] = current_month
            self.credits_data["reset_date"] = self._get_next_reset_date()
            self._save_credits()
            logger.info(f"Credits reset for new month: {current_month}")

    def add_request(self, tokens_used: int = 0):
        """Track a request and token usage"""
        self._check_reset_month()
        self.credits_data["monthly_requests"] += 1
        self.credits_data["monthly_tokens"] += tokens_used
        self.credits_data["last_request"] = datetime.utcnow().isoformat()
        self._save_credits()

    def add_error(self, error_msg: str):
        """Track an error"""
        self.credits_data["last_error"] = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": error_msg
        }
        self._save_credits()

    def get_status(self) -> dict:
        """Get current credit status"""
        self._check_reset_month()
        
        usage_percent = (self.credits_data["monthly_requests"] / 60) * 100  # 60 requests/min = ~1440/day
        is_over_limit = self.credits_data["monthly_requests"] > 60
        is_warning = usage_percent >= (CREDIT_WARNING_THRESHOLD * 100)
        
        return {
            "requests_used": self.credits_data["monthly_requests"],
            "requests_limit": 60,
            "usage_percent": min(usage_percent, 100),
            "is_over_limit": is_over_limit,
            "is_warning": is_warning,
            "current_month": self.credits_data["current_month"],
            "reset_date": self.credits_data["reset_date"],
            "last_request": self.credits_data["last_request"],
            "last_error": self.credits_data.get("last_error"),
            "status_message": self._get_status_message(usage_percent, is_over_limit),
        }

    def _get_status_message(self, usage_percent: float, is_over_limit: bool) -> str:
        """Get human-readable status message"""
        if is_over_limit:
            reset_date = self.credits_data["reset_date"]
            return f"⚠️ FREE TIER LIMIT REACHED! Your monthly credit limit has been exceeded. Service will resume on {reset_date} (next billing cycle)."
        elif usage_percent >= (CREDIT_WARNING_THRESHOLD * 100):
            requests_left = 60 - self.credits_data["monthly_requests"]
            reset_date = self.credits_data["reset_date"]
            return f"⚠️ WARNING: You're using {usage_percent:.1f}% of your monthly free credits. Only {requests_left} requests remaining. Resets on {reset_date}."
        else:
            requests_left = 60 - self.credits_data["monthly_requests"]
            return f"✅ Good: Using {usage_percent:.1f}% of free tier. {requests_left} requests available this month."


# Global credit manager instance
_credit_manager: Optional[CreditManager] = None


def get_credit_manager() -> CreditManager:
    """Get or create the global credit manager"""
    global _credit_manager
    if _credit_manager is None:
        _credit_manager = CreditManager()
    return _credit_manager


async def gemini_chat(
    message: str, 
    history: Optional[List[dict]] = None, 
    language: str = 'en',
    model: str = 'gemini-1.5-flash'
) -> Tuple[str, dict]:
    """
    Chat with Google Gemini API with credit management
    
    Returns: (response_text, status_dict)
    """
    history = history or []
    credit_mgr = get_credit_manager()
    credit_status = credit_mgr.get_status()

    # Check if over limit
    if credit_status["is_over_limit"]:
        error_msg = credit_status["status_message"]
        credit_mgr.add_error(error_msg)
        return error_msg, credit_status

    # Initialize Gemini client
    api_key = os.environ.get('GOOGLE_GEMINI_API_KEY')
    if not api_key or genai is None:
        fallback_msg = "⚠️ Gemini API not configured. Please set GOOGLE_GEMINI_API_KEY environment variable."
        logger.error(fallback_msg)
        credit_mgr.add_error(fallback_msg)
        return fallback_msg, credit_status

    try:
        genai.configure(api_key=api_key)
        
        # Build conversation history
        messages = []
        for item in history:
            role = item.get('role', 'user')
            content = item.get('content', '')
            if role in ['user', 'assistant']:
                messages.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
        
        # Add current message
        messages.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        # Get model
        model_obj = genai.GenerativeModel(model)

        # Generate response
        response = await asyncio.to_thread(
            model_obj.generate_content,
            messages,
            stream=False,
        )

        # Extract text
        response_text = response.text if hasattr(response, 'text') else str(response)

        # Track the request
        estimated_tokens = len(message.split()) + len(response_text.split())
        credit_mgr.add_request(tokens_used=estimated_tokens)
        
        # Get updated status
        updated_status = credit_mgr.get_status()
        
        # Add warning if needed
        if updated_status["is_warning"]:
            response_text += f"\n\n💡 {updated_status['status_message']}"

        return response_text, updated_status

    except Exception as e:
        error_msg = f"Error calling Gemini API: {str(e)}"
        logger.error(error_msg)
        credit_mgr.add_error(error_msg)
        
        # Provide helpful error message
        if "quota" in str(e).lower() or "limit" in str(e).lower():
            error_msg = f"❌ API QUOTA EXCEEDED: Your free tier request limit has been reached. Credits will reset on {credit_status['reset_date']}. Please try again later."
        elif "not found" in str(e).lower() or "401" in str(e):
            error_msg = "❌ Authentication failed. Please check your GOOGLE_GEMINI_API_KEY."
        
        return error_msg, credit_status


async def generate_quiz_questions(
    topic: Optional[str], 
    difficulty: str = 'beginner', 
    count: int = 10, 
    language: str = 'en'
) -> Tuple[List[dict], dict]:
    """
    Generate quiz questions using Gemini API
    
    Returns: (questions_list, status_dict)
    """
    credit_mgr = get_credit_manager()
    credit_status = credit_mgr.get_status()

    # Check if over limit
    if credit_status["is_over_limit"]:
        error_msg = credit_status["status_message"]
        credit_mgr.add_error(error_msg)
        return [], credit_status

    system_prompt = f"""You are an expert quiz generator for Indian elections and civic education.
Generate {count} multiple choice questions about {topic or 'Indian elections'} at {difficulty} level.
Respond ONLY with valid JSON array in this format:
[
  {{
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Why this is correct",
    "category": "election_basics"
  }}
]
"""

    question = f"Generate {count} quiz questions about {topic or 'Indian elections'} at {difficulty} difficulty in {language}."
    
    response_text, status = await gemini_chat(question, history=[], language=language)
    
    # Parse JSON from response
    questions = []
    try:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\[[\s\S]*\]', response_text)
        if json_match:
            questions = json.loads(json_match.group())
    except Exception as e:
        logger.error(f"Failed to parse quiz questions JSON: {e}")
        questions = _get_fallback_quiz_questions(count, difficulty)

    return questions, status


def _get_fallback_quiz_questions(count: int, difficulty: str) -> List[dict]:
    """Fallback quiz questions when Gemini is unavailable"""
    base_questions = [
        {
            'question': 'What is the minimum voting age in India?',
            'options': ['16', '18', '21', '25'],
            'correct_index': 1,
            'explanation': 'The minimum voting age in India is 18 years (Article 326).',
            'category': 'general_election',
        },
        {
            'question': 'What does EVM stand for?',
            'options': ['Electronic Voting Machine', 'Electronic Vote Monitor', 'Election Verification Mechanism', 'Electronic Voter Map'],
            'correct_index': 0,
            'explanation': 'EVM stands for Electronic Voting Machine.',
            'category': 'voting_process',
        },
        {
            'question': 'Which form is used for voter registration?',
            'options': ['Form 5', 'Form 6', 'Form 7', 'Form 8'],
            'correct_index': 1,
            'explanation': 'Form 6 is used for voter registration / inclusion in electoral roll.',
            'category': 'forms',
        },
        {
            'question': 'What is VVPAT?',
            'options': ['Vote Verification Paper Audit Trail', 'Voter Verified Paper Audit Trail', 'Voting Value Paper Assessment Tool', 'Vote Validation Process Authority'],
            'correct_index': 1,
            'explanation': 'VVPAT stands for Voter Verified Paper Audit Trail.',
            'category': 'voting_process',
        },
        {
            'question': 'Which article of the Indian Constitution establishes ECI?',
            'options': ['Article 312', 'Article 320', 'Article 324', 'Article 328'],
            'correct_index': 2,
            'explanation': 'Article 324 establishes the Election Commission of India.',
            'category': 'constitution',
        },
    ]

    # Repeat to meet count
    questions = []
    i = 0
    while len(questions) < count:
        questions.append(base_questions[i % len(base_questions)])
        i += 1

    return questions[:count]


async def translate_text(text: str, target_lang: str) -> Tuple[str, dict]:
    """
    Translate text using Gemini
    
    Returns: (translated_text, status_dict)
    """
    lang_names = {
        'hi': 'Hindi',
        'te': 'Telugu',
        'ta': 'Tamil',
        'kn': 'Kannada',
        'en': 'English'
    }
    
    prompt = f"Translate this civic education text to {lang_names.get(target_lang, target_lang)} accurately:\n\n{text}"
    
    return await gemini_chat(prompt, history=[], language=target_lang)


def get_credit_status() -> dict:
    """Get current credit status without making a request"""
    credit_mgr = get_credit_manager()
    return credit_mgr.get_status()


def reset_credits_for_testing() -> dict:
    """Reset credits (for testing only)"""
    credit_mgr = get_credit_manager()
    credit_mgr.credits_data["monthly_requests"] = 0
    credit_mgr.credits_data["monthly_tokens"] = 0
    credit_mgr._save_credits()
    return credit_mgr.get_status()
