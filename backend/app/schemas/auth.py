from pydantic import BaseModel, EmailStr
from typing import Optional, List


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    name: str
    email: str


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: str
    university: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[list] = []
    courses: Optional[list] = []


class UserUpdate(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[list] = None
    courses: Optional[list] = None


class AIAnalysisResponse(BaseModel):
    missing_fields: List[str] = []
    tips: List[str] = []
    club_suggestions: List[str] = []
    event_suggestions: List[str] = []