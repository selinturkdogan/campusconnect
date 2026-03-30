from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StudyGroupCreate(BaseModel):
    course_name: str
    course_code: str
    description: Optional[str] = None
    university: Optional[str] = None


class StudyGroupUpdate(BaseModel):
    course_name: Optional[str] = None
    course_code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class StudyGroupResponse(BaseModel):
    id: str
    course_name: str
    course_code: str
    description: Optional[str]
    creator_id: str
    university: Optional[str]
    is_active: bool
    created_at: datetime


class MessageCreate(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    group_id: str
    sender_id: str
    content: Optional[str]
    file_url: Optional[str]
    file_name: Optional[str]
    created_at: datetime
