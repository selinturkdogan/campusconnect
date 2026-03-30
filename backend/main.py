from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, notifications, clubs, events, study_groups
from app.core.config import settings

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


@app.get("/")
def root():
    return {"message": "CampusConnect API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
