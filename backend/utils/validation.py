"""
Input validation and sanitization utilities for API endpoints.
"""

import re
from typing import Optional
from html import escape


# ============================================================================
# CONSTANTS
# ============================================================================

ALLOWED_LANGUAGES = {'en', 'hi', 'te', 'ta', 'kn'}
ALLOWED_DIFFICULTIES = {'beginner', 'student', 'exam'}
ALLOWED_QUIZ_TOPICS = {
    'general_election', 'constitution', 'voting_process', 
    'current_affairs', 'state_elections', 'eci_history'
}

MAX_MESSAGE_LENGTH = 2000
MIN_MESSAGE_LENGTH = 1
MAX_USERNAME_LENGTH = 100
MAX_EMAIL_LENGTH = 255


# ============================================================================
# SANITIZATION FUNCTIONS
# ============================================================================

def sanitize_string(text: str, max_length: int = 2000, allow_html: bool = False) -> str:
    """
    Sanitize user input string.
    
    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length
        allow_html: Whether to allow HTML (default: False)
        
    Returns:
        Sanitized string
        
    Raises:
        ValueError: If input is invalid
    """
    if not isinstance(text, str):
        raise ValueError("Input must be a string")
    
    # Strip whitespace
    text = text.strip()
    
    # Check length
    if len(text) < MIN_MESSAGE_LENGTH:
        raise ValueError(f"Input too short (minimum {MIN_MESSAGE_LENGTH} characters)")
    
    if len(text) > max_length:
        raise ValueError(f"Input too long (maximum {max_length} characters)")
    
    # Remove potential XSS vectors
    if not allow_html:
        # Escape HTML entities
        text = escape(text)
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text


def validate_language(language: str) -> str:
    """
    Validate and normalize language code.
    
    Args:
        language: Language code
        
    Returns:
        Normalized language code
        
    Raises:
        ValueError: If language is invalid
    """
    if not isinstance(language, str):
        raise ValueError("Language must be a string")
    
    language = language.lower().strip()
    
    if language not in ALLOWED_LANGUAGES:
        raise ValueError(
            f"Invalid language '{language}'. Allowed: {', '.join(sorted(ALLOWED_LANGUAGES))}"
        )
    
    return language


def validate_difficulty(difficulty: str) -> str:
    """
    Validate and normalize difficulty level.
    
    Args:
        difficulty: Difficulty level
        
    Returns:
        Normalized difficulty
        
    Raises:
        ValueError: If difficulty is invalid
    """
    if not isinstance(difficulty, str):
        raise ValueError("Difficulty must be a string")
    
    difficulty = difficulty.lower().strip()
    
    if difficulty not in ALLOWED_DIFFICULTIES:
        raise ValueError(
            f"Invalid difficulty '{difficulty}'. Allowed: {', '.join(sorted(ALLOWED_DIFFICULTIES))}"
        )
    
    return difficulty


def validate_quiz_topic(topic: str) -> str:
    """
    Validate and normalize quiz topic.
    
    Args:
        topic: Quiz topic
        
    Returns:
        Normalized topic
        
    Raises:
        ValueError: If topic is invalid
    """
    if not isinstance(topic, str):
        raise ValueError("Topic must be a string")
    
    topic = topic.lower().strip()
    
    if topic not in ALLOWED_QUIZ_TOPICS:
        raise ValueError(
            f"Invalid topic '{topic}'. Allowed: {', '.join(sorted(ALLOWED_QUIZ_TOPICS))}"
        )
    
    return topic


def validate_email(email: str) -> str:
    """
    Validate email address.
    
    Args:
        email: Email address
        
    Returns:
        Normalized email
        
    Raises:
        ValueError: If email is invalid
    """
    if not isinstance(email, str):
        raise ValueError("Email must be a string")
    
    email = email.strip().lower()
    
    if len(email) > MAX_EMAIL_LENGTH:
        raise ValueError(f"Email too long (maximum {MAX_EMAIL_LENGTH} characters)")
    
    # Basic email regex (RFC 5322 simplified)
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise ValueError("Invalid email format")
    
    return email


def validate_username(username: str) -> str:
    """
    Validate username.
    
    Args:
        username: Username
        
    Returns:
        Normalized username
        
    Raises:
        ValueError: If username is invalid
    """
    if not isinstance(username, str):
        raise ValueError("Username must be a string")
    
    username = username.strip()
    
    if len(username) < 3:
        raise ValueError("Username must be at least 3 characters")
    
    if len(username) > MAX_USERNAME_LENGTH:
        raise ValueError(f"Username too long (maximum {MAX_USERNAME_LENGTH} characters)")
    
    # Allow alphanumeric, underscore, hyphen only
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        raise ValueError("Username can only contain letters, numbers, underscore, and hyphen")
    
    return username


# ============================================================================
# CHAT INPUT VALIDATION
# ============================================================================

class ChatInputValidator:
    """Validator for chat request inputs."""
    
    @staticmethod
    def validate(message: str, language: str = 'en', session_id: Optional[str] = None) -> dict:
        """
        Validate chat request inputs.
        
        Args:
            message: User message
            language: Language code
            session_id: Session ID
            
        Returns:
            Dictionary with validated inputs
            
        Raises:
            ValueError: If any input is invalid
        """
        # Validate message
        try:
            message = sanitize_string(message, max_length=MAX_MESSAGE_LENGTH)
        except ValueError as e:
            raise ValueError(f"Invalid message: {str(e)}")
        
        # Validate language
        try:
            language = validate_language(language)
        except ValueError as e:
            raise ValueError(f"Invalid language: {str(e)}")
        
        # Validate session_id if provided
        if session_id:
            session_id = session_id.strip()
            if not re.match(r'^[a-f0-9-]{36}$', session_id):  # UUID format
                raise ValueError("Invalid session ID format")
        
        return {
            'message': message,
            'language': language,
            'session_id': session_id,
        }


# ============================================================================
# QUIZ INPUT VALIDATION
# ============================================================================

class QuizInputValidator:
    """Validator for quiz request inputs."""
    
    @staticmethod
    def validate(
        topic: str,
        difficulty: str = 'beginner',
        language: str = 'en',
        count: int = 10
    ) -> dict:
        """
        Validate quiz request inputs.
        
        Args:
            topic: Quiz topic
            difficulty: Difficulty level
            language: Language code
            count: Number of questions
            
        Returns:
            Dictionary with validated inputs
            
        Raises:
            ValueError: If any input is invalid
        """
        # Validate topic
        try:
            topic = validate_quiz_topic(topic)
        except ValueError as e:
            raise ValueError(f"Invalid topic: {str(e)}")
        
        # Validate difficulty
        try:
            difficulty = validate_difficulty(difficulty)
        except ValueError as e:
            raise ValueError(f"Invalid difficulty: {str(e)}")
        
        # Validate language
        try:
            language = validate_language(language)
        except ValueError as e:
            raise ValueError(f"Invalid language: {str(e)}")
        
        # Validate count
        if not isinstance(count, int) or count < 1 or count > 50:
            raise ValueError("Question count must be between 1 and 50")
        
        return {
            'topic': topic,
            'difficulty': difficulty,
            'language': language,
            'count': count,
        }
