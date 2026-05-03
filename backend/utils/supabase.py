import os
import asyncio
from typing import Optional

try:
    from supabase import create_client
except Exception:
    create_client = None


_client = None


def _init_client():
    global _client
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')
    if not url or not key or create_client is None:
        return None
    if _client is None:
        _client = create_client(url, key)
    return _client


async def get_user_progress(user_id: str) -> Optional[dict]:
    """Fetch user progress from Supabase; returns a dict or None."""
    client = _init_client()
    if client is None:
        # fallback mock
        return {
            'user_id': user_id,
            'xp': 120,
            'level': 3,
            'badges': ['first_vote'],
            'quiz_scores': [],
            'streak': 2,
        }

    def _fetch():
        table = client.table('user_progress')
        res = table.select('*').eq('user_id', user_id).execute()
        return res

    res = await asyncio.to_thread(_fetch)
    # supabase-py returns dict with data key
    data = getattr(res, 'data', None) or (res.get('data') if isinstance(res, dict) else None)
    if data and len(data) > 0:
        return data[0]
    return None


async def upsert_user_progress(user_id: str, payload: dict) -> dict:
    client = _init_client()
    if client is None:
        return {**payload, 'user_id': user_id}

    def _upsert():
        table = client.table('user_progress')
        res = table.upsert({**payload, 'user_id': user_id}).execute()
        return res

    res = await asyncio.to_thread(_upsert)
    return getattr(res, 'data', res)
"""
Supabase utilities for database operations
"""
from supabase import create_client, Client
import os

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(url, key)

def get_user(user_id: str):
    """Fetch user profile from database"""
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error fetching user: {str(e)}")
        return None

def update_user_xp(user_id: str, xp_gained: int):
    """Update user XP"""
    try:
        response = supabase.table("users").select("xp").eq("id", user_id).execute()
        current_xp = response.data[0]["xp"] if response.data else 0
        
        supabase.table("users").update({"xp": current_xp + xp_gained}).eq("id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error updating XP: {str(e)}")
        return False

def get_leaderboard(limit: int = 10):
    """Get top users by XP"""
    try:
        response = supabase.table("users").select("*").order("xp", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching leaderboard: {str(e)}")
        return []
