from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.events import EventCreate, EventUpdate
from app.schemas.notifications import send_notification
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.security import get_current_user, require_admin

router = APIRouter()


@router.get("/")
def list_events(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("events").select("*").order("event_date").execute()
    return result.data


@router.get("/{event_id}")
def get_event(event_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return result.data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(body: EventCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()

    if body.is_school_wide and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create school-wide events")

    if body.club_id:
        club = supabase.table("clubs").select("admin_user_id, name").eq("id", body.club_id).single().execute()
        if not club.data:
            raise HTTPException(status_code=404, detail="Club not found")
        if club.data["admin_user_id"] != current_user["id"] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only club admins can create club events")

    result = supabase.table("events").insert({
        "title": body.title,
        "description": body.description,
        "club_id": body.club_id,
        "created_by": current_user["id"],
        "event_date": body.event_date.isoformat(),
        "location": body.location,
        "capacity": body.capacity,
        "is_school_wide": body.is_school_wide,
    }).execute()

    event = result.data[0]

    if body.is_school_wide:
        supabase_admin = get_supabase_admin()
        users = supabase_admin.table("users").select("id").eq("role", "student").execute()
        for user in users.data:
            send_notification(
                user_id=user["id"],
                type="new_school_event",
                title=f"New school event: {body.title}",
                body=f"{body.title} on {body.event_date.strftime('%b %d')} at {body.location}.",
                link=f"/events/{event['id']}",
            )

    return event


@router.put("/{event_id}")
def update_event(event_id: str, body: EventUpdate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    event = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.data["created_by"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if "event_date" in update_data:
        update_data["event_date"] = update_data["event_date"].isoformat()

    result = supabase.table("events").update(update_data).eq("id", event_id).execute()
    return result.data[0]


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    event = supabase.table("events").select("created_by").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.data["created_by"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase.table("events").delete().eq("id", event_id).execute()


@router.post("/{event_id}/attend", status_code=status.HTTP_201_CREATED)
def attend_event(event_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    event = supabase.table("events").select("*").eq("id", event_id).single().execute()
    if not event.data:
        raise HTTPException(status_code=404, detail="Event not found")

    result = supabase.table("event_attendees").insert({
        "event_id": event_id,
        "user_id": current_user["id"],
    }).execute()
    return result.data[0]


@router.delete("/{event_id}/attend", status_code=status.HTTP_204_NO_CONTENT)
def cancel_attendance(event_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    supabase.table("event_attendees").delete().eq("event_id", event_id).eq("user_id", current_user["id"]).execute()


@router.get("/{event_id}/attendees")
def get_attendees(event_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("event_attendees").select("*").eq("event_id", event_id).execute()
    return result.data
