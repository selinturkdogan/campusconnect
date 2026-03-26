from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ClubCreate(BaseModel):
    name: str
    description: str
    category: str
    is_open: bool = True


class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_open: Optional[bool] = None


class ClubResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    logo_url: Optional[str]
    admin_user_id: str
    is_open: bool
    created_at: datetime


class MembershipStatusUpdate(BaseModel):
    status: str
