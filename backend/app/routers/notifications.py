from fastapi import APIRouter, Depends
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.security import get_current_user

router = APIRouter()


@router.get("/")
def get_notifications(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_admin()
    result = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data


@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_admin()
    supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", current_user["id"]).execute()
    return {"success": True}


@router.patch("/read-all")
def mark_all_read(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_admin()
    supabase.table("notifications").update({"is_read": True}).eq("user_id", current_user["id"]).eq("is_read", False).execute()
    return {"success": True}


@router.get("/unread-count")
def unread_count(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_admin()
    result = (
        supabase.table("notifications")
        .select("id", count="exact")
        .eq("user_id", current_user["id"])
        .eq("is_read", False)
        .execute()
    )
    return {"count": result.count}