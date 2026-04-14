from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, notifications, clubs, events, study_groups
from app.core.config import settings
from app.core.supabase import get_supabase_admin
from app.schemas.notifications import send_notification
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CampusConnect API",
    description="Backend API for CampusConnect academic social platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(clubs.router, prefix="/api/clubs", tags=["Clubs"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(study_groups.router, prefix="/api/study-groups", tags=["Study Groups"])


async def send_event_reminders():
    """
    Runs every hour. Finds events starting in the next 24-25 hours
    and sends reminder notifications to attendees who haven't been notified yet.
    """
    while True:
        try:
            supabase = get_supabase_admin()
            now = datetime.utcnow()
            window_start = (now + timedelta(hours=24)).isoformat()
            window_end = (now + timedelta(hours=25)).isoformat()

            # Find events in the 24-25h window
            upcoming = supabase.table("events").select("id, title, location, event_date") \
                .gte("event_date", window_start) \
                .lte("event_date", window_end) \
                .execute()

            for event in (upcoming.data or []):
                # Get attendees
                attendees = supabase.table("event_attendees").select("user_id") \
                    .eq("event_id", event["id"]).execute()

                event_time = datetime.fromisoformat(event["event_date"].replace("Z", ""))
                formatted_time = event_time.strftime("%b %d at %H:%M")

                for att in (attendees.data or []):
                    # Check if already notified
                    existing = supabase.table("notifications").select("id") \
                        .eq("user_id", att["user_id"]) \
                        .eq("type", "event_reminder") \
                        .like("link", f"%/events/{event['id']}%") \
                        .execute()
                    if not existing.data:
                        send_notification(
                            user_id=att["user_id"],
                            type="event_reminder",
                            title=f"Reminder: {event['title']} is tomorrow",
                            body=f"{event['title']} starts {formatted_time} at {event['location']}.",
                            link=f"/events/{event['id']}",
                        )
        except Exception as e:
            logger.error(f"Event reminder error: {e}")

        await asyncio.sleep(3600)  # Run every hour


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(send_event_reminders())
    logger.info("Event reminder scheduler started.")


@app.get("/")
def root():
    return {"message": "CampusConnect API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}