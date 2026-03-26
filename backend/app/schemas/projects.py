from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectPostCreate(BaseModel):
    title: str
    description: str
    tech_stack: List[str] = []
    roles_needed: List[str] = []
    github_url: Optional[str] = None


class ProjectPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    roles_needed: Optional[List[str]] = None
    github_url: Optional[str] = None
    status: Optional[str] = None


class ProjectPostResponse(BaseModel):
    id: str
    title: str
    description: str
    owner_id: str
    tech_stack: List[str]
    roles_needed: List[str]
    status: str
    github_url: Optional[str]
    created_at: datetime


class ApplicationCreate(BaseModel):
    role: str
    motivation: str


class ApplicationResponse(BaseModel):
    id: str
    project_id: str
    applicant_id: str
    role: str
    motivation: str
    status: str
    applied_at: datetime


class ApplicationStatusUpdate(BaseModel):
    status: str
