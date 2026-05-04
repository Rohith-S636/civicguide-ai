import os
import asyncio
from typing import List, Optional

try:
    from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
except Exception:
    Anthropic = None
    HUMAN_PROMPT = ""  # placeholders if SDK not installed
    AI_PROMPT = ""


async def anthropic_chat(message: str, history: Optional[List[dict]] = None, language: str = 'en') -> str:
    """Simple wrapper around Anthropic API. Falls back to an echo if Anthropic isn't configured.

    Note: Keep prompts short and sandboxed here. For production, implement proper prompt construction and streaming.
    """
    history = history or []
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key or Anthropic is None:
        # Fallback reply for development
        return f"(mock reply) I received your message: {message}"

    client = Anthropic(api_key=api_key)

    prompt_parts = []
    for item in history:
        role = item.get('role', 'user')
        content = item.get('content', '')
        if role == 'user':
            prompt_parts.append(f"Human: {content}\n")
        else:
            prompt_parts.append(f"Assistant: {content}\n")

    prompt_parts.append(f"Human: {message}\n")

    prompt = "".join(prompt_parts)

    # Use Anthropic completion
    response = await asyncio.to_thread(
        client.completions.create,
        model=os.environ.get('ANTHROPIC_MODEL', 'claude-2.1'),
        prompt=f"{HUMAN_PROMPT} {prompt} {AI_PROMPT}",
        max_tokens_to_sample=512,
    )

    text = response.get('completion') if isinstance(response, dict) else getattr(response, 'completion', None)
    return text or ""


async def generate_quiz_questions(topic: Optional[str], difficulty: str = 'beginner', count: int = 10, language: str = 'en') -> List[dict]:
    # For now return a simple set of sample questions. Integration with Anthropic or LangChain can be added.
    sample = [
        {
            'question': 'What is the minimum voting age in India?',
            'options': ['16', '18', '21', '25'],
            'correct_index': 1,
            'explanation': 'The minimum voting age in India is 18 years.',
            'category': 'general_election',
        },
        {
            'question': 'What does EVM stand for?',
            'options': ['Electronic Voting Machine', 'Electronic Vote Monitor', 'Election Verification Mechanism', 'Electronic Voter Map'],
            'correct_index': 0,
            'explanation': 'EVM stands for Electronic Voting Machine.',
            'category': 'voting_process',
        },
    ]
    # Repeat or slice to meet requested count
    out = []
    i = 0
    while len(out) < count:
        out.append(sample[i % len(sample)])
        i += 1
    return out
"""
Claude AI utilities
"""
# Safe Anthropic helpers — import lazily and fall back to mocks when SDK or API key
import os

def create_client():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key is None:
        return None
    try:
        # Import when needed to avoid hard dependency at module import time
        from anthropic import Anthropic
    except Exception:
        return None
    return Anthropic(api_key=api_key)


def generate_response(prompt: str, system_prompt: str = "", model: str = "claude-3-5-sonnet-20241022") -> str:
    client = create_client()
    if client is None:
        return f"(mock claude) {prompt[:200]}"
    try:
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )
        # Best-effort extract
        if isinstance(response, dict):
            content = response.get('content')
            if content and isinstance(content, list) and len(content) > 0:
                return content[0].get('text', '')
            return ''
        return getattr(response, 'content', [{}])[0].get('text', '')
    except Exception as e:
        return f"Error generating response: {str(e)}"
