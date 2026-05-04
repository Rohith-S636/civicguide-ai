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


# Safe synchronous helpers that use the lazy client. These functions gracefully
# fall back to mock data when SUPABASE_URL / keys are not provided so importing
# the module doesn't fail in dev or CI.

def get_user(user_id: str):
    client = _init_client()
    if client is None:
        return None
    try:
        res = client.table("users").select("*").eq("id", user_id).execute()
        return getattr(res, 'data', None)[0] if getattr(res, 'data', None) else None
    except Exception:
        return None


def update_user_xp(user_id: str, xp_gained: int):
    client = _init_client()
    if client is None:
        return False
    try:
        resp = client.table("users").select("xp").eq("id", user_id).execute()
        current_xp = getattr(resp, 'data', [{}])[0].get('xp', 0) if getattr(resp, 'data', None) else 0
        client.table("users").update({"xp": current_xp + xp_gained}).eq("id", user_id).execute()
        return True
    except Exception:
        return False


def get_leaderboard(limit: int = 10):
    client = _init_client()
    if client is None:
        return []
    try:
        resp = client.table("users").select("*").order("xp", desc=True).limit(limit).execute()
        return getattr(resp, 'data', [])
    except Exception:
        return []
