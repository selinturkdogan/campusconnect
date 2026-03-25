from supabase import create_client, Client
from app.core.config import settings

_supabase: Client = None
_supabase_admin: Client = None


def get_supabase() -> Client:
    """Returns Supabase client with anon key (respects RLS)."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _supabase


def get_supabase_admin() -> Client:
    """Returns Supabase client with service role key (bypasses RLS).
    Use only for admin operations like bulk user creation."""
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _supabase_admin
