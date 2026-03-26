from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.supabase import get_supabase_admin


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    body: str
    link: Optional[str] = None


def send_notification(user_id: str, type: str, title: str, body: str, link: str = None):
    supabase = get_supabase_admin()
    supabase.table("notifications").insert({
        "user_id": user_id,
        "type": type,
        "title": title,
        "body": body,
        "link": link,
    }).execute()


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    link: Optional[str]
    is_read: bool
    created_at: datetime
