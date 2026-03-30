from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.clubs import ClubCreate, ClubUpdate, MembershipStatusUpdate
from app.schemas.notifications import send_notification
from app.core.supabase import get_supabase
from app.core.security import get_current_user

router = APIRouter()


@router.get("/")
def list_clubs(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("clubs").select("*").order("created_at", desc=True).execute()
    return result.data


@router.get("/{club_id}")
def get_club(club_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("clubs").select("*").eq("id", club_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Club not found")
    return result.data


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_club(body: ClubCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create clubs")

    supabase = get_supabase()
    result = supabase.table("clubs").insert({
        "name": body.name,
        "description": body.description,
        "category": body.category,
        "is_open": body.is_open,
        "admin_user_id": current_user["id"],
    }).execute()

    club = result.data[0]

    supabase.table("club_memberships").insert({
        "club_id": club["id"],
        "user_id": current_user["id"],
        "role": "president",
        "status": "approved",
    }).execute()

    return club


@router.put("/{club_id}")
def update_club(club_id: str, body: ClubUpdate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    club = supabase.table("clubs").select("admin_user_id").eq("id", club_id).single().execute()
    if not club.data:
        raise HTTPException(status_code=404, detail="Club not found")
    if club.data["admin_user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = supabase.table("clubs").update(update_data).eq("id", club_id).execute()
    return result.data[0]


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(club_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    club = supabase.table("clubs").select("admin_user_id").eq("id", club_id).single().execute()
    if not club.data:
        raise HTTPException(status_code=404, detail="Club not found")
    if club.data["admin_user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase.table("clubs").delete().eq("id", club_id).execute()


@router.post("/{club_id}/join", status_code=status.HTTP_201_CREATED)
def join_club(club_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    club = supabase.table("clubs").select("*").eq("id", club_id).single().execute()
    if not club.data:
        raise HTTPException(status_code=404, detail="Club not found")

    membership_status = "approved" if club.data["is_open"] else "pending"

    result = supabase.table("club_memberships").insert({
        "club_id": club_id,
        "user_id": current_user["id"],
        "role": "member",
        "status": membership_status,
    }).execute()

    if membership_status == "pending":
        send_notification(
            user_id=club.data["admin_user_id"],
            type="club_application",
            title="New membership request",
            body=f"{current_user['name']} requested to join {club.data['name']}.",
            link=f"/clubs/{club_id}",
        )

    return result.data[0]


@router.delete("/{club_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_club(club_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    supabase.table("club_memberships").delete().eq("club_id", club_id).eq("user_id", current_user["id"]).execute()


@router.get("/{club_id}/members")
def get_members(club_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("club_memberships").select("*").eq("club_id", club_id).execute()
    return result.data


@router.patch("/{club_id}/members/{user_id}")
def update_member_status(
    club_id: str,
    user_id: str,
    body: MembershipStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    if body.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")

    supabase = get_supabase()
    club = supabase.table("clubs").select("name, admin_user_id").eq("id", club_id).single().execute()
    if not club.data:
        raise HTTPException(status_code=404, detail="Club not found")
    if club.data["admin_user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = supabase.table("club_memberships").update({"status": body.status}).eq("club_id", club_id).eq("user_id", user_id).execute()

    send_notification(
        user_id=user_id,
        type="club_application_result",
        title=f"Membership request {body.status}",
        body=f"Your request to join {club.data['name']} has been {body.status}.",
        link=f"/clubs/{club_id}",
    )

    return result.data[0]