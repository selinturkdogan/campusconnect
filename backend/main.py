from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
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


@app.get("/")
def root():
    return {"message": "CampusConnect API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
