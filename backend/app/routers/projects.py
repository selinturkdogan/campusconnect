from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.projects import (
    ProjectPostCreate, ProjectPostUpdate,
    ProjectPostResponse, ApplicationCreate,
    ApplicationResponse, ApplicationStatusUpdate
)
from app.schemas.notifications import send_notification
from app.core.supabase import get_supabase
from app.core.security import get_current_user

router = APIRouter()


@router.get("/")
def list_projects(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("project_posts").select("*").order("created_at", desc=True).execute()
    return result.data


@router.get("/{project_id}")
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("project_posts").select("*").eq("id", project_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectPostCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("project_posts").insert({
        "title": body.title,
        "description": body.description,
        "owner_id": current_user["id"],
        "tech_stack": body.tech_stack,
        "roles_needed": body.roles_needed,
        "github_url": body.github_url,
        "status": "open",
    }).execute()
    return result.data[0]


@router.put("/{project_id}")
def update_project(project_id: str, body: ProjectPostUpdate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    existing = supabase.table("project_posts").select("owner_id").eq("id", project_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if existing.data["owner_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = supabase.table("project_posts").update(update_data).eq("id", project_id).execute()
    return result.data[0]


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    existing = supabase.table("project_posts").select("owner_id").eq("id", project_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if existing.data["owner_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase.table("project_posts").delete().eq("id", project_id).execute()


@router.post("/{project_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_to_project(project_id: str, body: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()

    project = supabase.table("project_posts").select("*").eq("id", project_id).single().execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.data["status"] != "open":
        raise HTTPException(status_code=400, detail="Project is not accepting applications")
    if project.data["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot apply to your own project")

    result = supabase.table("project_applications").insert({
        "project_id": project_id,
        "applicant_id": current_user["id"],
        "role": body.role,
        "motivation": body.motivation,
        "status": "pending",
    }).execute()

    send_notification(
        user_id=project.data["owner_id"],
        type="project_application",
        title="New application to your project",
        body=f"{current_user['name']} applied for the {body.role} role in {project.data['title']}.",
        link=f"/projects/{project_id}",
    )

    return result.data[0]


@router.get("/{project_id}/applications")
def get_applications(project_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    project = supabase.table("project_posts").select("owner_id").eq("id", project_id).single().execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.data["owner_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = supabase.table("project_applications").select("*").eq("project_id", project_id).execute()
    return result.data


@router.patch("/{project_id}/applications/{application_id}")
def update_application_status(
    project_id: str,
    application_id: str,
    body: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be accepted or rejected")

    supabase = get_supabase()
    project = supabase.table("project_posts").select("owner_id, title").eq("id", project_id).single().execute()
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.data["owner_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    application = supabase.table("project_applications").select("*").eq("id", application_id).single().execute()
    if not application.data:
        raise HTTPException(status_code=404, detail="Application not found")

    result = supabase.table("project_applications").update({"status": body.status}).eq("id", application_id).execute()

    send_notification(
        user_id=application.data["applicant_id"],
        type="project_application_result",
        title=f"Your application was {body.status}!",
        body=f"Your application for {project.data['title']} has been {body.status}.",
        link=f"/projects/{project_id}",
    )

    return result.data[0]


@router.get("/my/posts")
def my_posts(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("project_posts").select("*").eq("owner_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data


@router.get("/my/applications")
def my_applications(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("project_applications").select("*").eq("applicant_id", current_user["id"]).order("applied_at", desc=True).execute()
    return result.data
