from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, LoginResponse, UserPublic, UserUpdate, AIAnalysisResponse
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.security import create_access_token, get_current_user
import os
import json
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as e:
        print("AUTH ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    supabase_user_id = auth_response.user.id

    try:
        result = (
            supabase.table("users")
            .select("id, email, name, role")
            .eq("id", supabase_user_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        print("DB ERROR:", e)
        raise HTTPException(status_code=500, detail="Database error")

    if not result or not result.data:
        raise HTTPException(
            status_code=404,
            detail="User profile not found. Contact admin.",
        )

    user = result.data

    token = create_access_token(
        data={
            "sub": user["id"],
            "role": user["role"],
            "email": user["email"],
        }
    )

    return LoginResponse(
        access_token=token,
        role=user["role"],
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
    )


@router.get("/me", response_model=UserPublic)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile")
def update_profile(body: UserUpdate, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_admin()
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        supabase.table("users")
        .update(update_data)
        .eq("id", current_user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Update failed")
    return result.data[0]


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def ai_profile_analysis(current_user: dict = Depends(get_current_user)):
    """
    AI-powered profile analysis using real clubs and events from the DB.
    Cached per user for 24 hours.
    """
    supabase = get_supabase_admin()

    # Check 24h cache
    cached_at = current_user.get("ai_analysis_updated_at")
    cached_result = current_user.get("ai_analysis_cache")
    if cached_at and cached_result:
        try:
            updated = datetime.fromisoformat(cached_at.replace("Z", "+00:00"))
            if datetime.now(updated.tzinfo) - updated < timedelta(hours=24):
                return AIAnalysisResponse(**json.loads(cached_result))
        except Exception:
            pass

    # Fetch real clubs and events from DB
    try:
        clubs_result = supabase.table("clubs").select("id, name, category, description").eq("status", "active").execute()
        real_clubs = clubs_result.data or []
    except Exception:
        real_clubs = []

    try:
        events_result = supabase.table("events").select("id, title, description, event_type").execute()
        real_events = events_result.data or []
    except Exception:
        real_events = []

    # Build profile summary
    profile_summary = {
        "department": current_user.get("department", ""),
        "year": current_user.get("year", ""),
        "skills": current_user.get("skills", []),
        "courses": current_user.get("courses", []),
        "github_url": current_user.get("github_url", ""),
        "bio": current_user.get("bio", ""),
    }

    # Check missing fields
    missing_fields = []
    if not profile_summary["department"]: missing_fields.append("department")
    if not profile_summary["year"]: missing_fields.append("year")
    if not profile_summary["skills"]: missing_fields.append("skills")
    if not profile_summary["courses"]: missing_fields.append("courses")
    if not profile_summary["github_url"]: missing_fields.append("github_url")
    if not profile_summary["bio"]: missing_fields.append("bio")

    tips = []
    club_suggestions = []
    event_suggestions = []

    openai_api_key = os.getenv("OPENAI_API_KEY", "")

    if openai_api_key and (real_clubs or real_events):
        try:
            import httpx
            clubs_text = "\n".join([f"- {c['name']} ({c.get('category','')}: {c.get('description','')})" for c in real_clubs[:20]])
            events_text = "\n".join([f"- {e['title']} ({e.get('description','')})" for e in real_events[:20]])

            prompt = f"""You are an academic advisor AI for CampusConnect university platform.
Analyze this student profile and suggest matching clubs and events from the lists below.

Student Profile:
- Department: {profile_summary['department'] or 'Not specified'}
- Year: {profile_summary['year'] or 'Not specified'}
- Skills: {', '.join(profile_summary['skills']) if profile_summary['skills'] else 'None'}
- Courses: {', '.join(profile_summary['courses']) if profile_summary['courses'] else 'None'}
- Bio: {profile_summary['bio'] or 'Not written'}

Available Clubs:
{clubs_text or 'No clubs available'}

Available Events:
{events_text or 'No events available'}

Respond ONLY with a JSON object (no markdown) with these exact keys:
{{
  "tips": ["tip1", "tip2", "tip3"],
  "club_suggestions": ["Exact Club Name from the list above"],
  "event_suggestions": ["Exact Event Title from the list above"]
}}
Only suggest clubs and events from the lists above. Max 3 clubs, max 3 events."""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_api_key}"},
                    json={
                        "model": "gpt-4o",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 500,
                        "temperature": 0.5,
                    },
                    timeout=15.0,
                )
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"].strip()
                parsed = json.loads(content)
                tips = parsed.get("tips", [])
                club_suggestions = parsed.get("club_suggestions", [])
                event_suggestions = parsed.get("event_suggestions", [])
        except Exception as e:
            print("OpenAI error:", e)

    # Fallback: simple skill-based matching without AI
    if not club_suggestions and real_clubs:
        user_skills = [s.lower() for s in (profile_summary["skills"] or [])]
        user_courses = [c.lower() for c in (profile_summary["courses"] or [])]
        user_dept = (profile_summary["department"] or "").lower()

        for club in real_clubs:
            club_text = f"{club.get('name','')} {club.get('category','')} {club.get('description','')}".lower()
            match = any(skill in club_text for skill in user_skills + user_courses + [user_dept])
            if match:
                club_suggestions.append(club["name"])
            if len(club_suggestions) >= 3:
                break

        # If still no match, suggest first 3
        if not club_suggestions:
            club_suggestions = [c["name"] for c in real_clubs[:3]]

    if not event_suggestions and real_events:
        event_suggestions = [e["title"] for e in real_events[:3]]

    if not tips:
        if "skills" in missing_fields:
            tips.append("Add your skills to get matched with relevant projects and clubs.")
        if "github_url" in missing_fields:
            tips.append("Link your GitHub profile to showcase your work to other students.")
        if "bio" in missing_fields:
            tips.append("Write a short bio to introduce yourself to the community.")
        if "courses" in missing_fields:
            tips.append("Add your current courses to find relevant study groups.")
        if not tips:
            tips = ["Your profile looks great! Keep it updated as you learn new skills."]

    result = AIAnalysisResponse(
        missing_fields=missing_fields,
        tips=tips,
        club_suggestions=club_suggestions,
        event_suggestions=event_suggestions,
    )

    # Cache result
    try:
        supabase.table("users").update({
            "ai_analysis_cache": json.dumps(result.model_dump()),
            "ai_analysis_updated_at": datetime.utcnow().isoformat(),
        }).eq("id", current_user["id"]).execute()
    except Exception as e:
        print("Cache save error:", e)

    return result
    """
    AI-powered profile analysis using OpenAI GPT-4o.
    Cached per user for 24 hours in the users table (ai_analysis_cache, ai_analysis_updated_at).
    Input: department, year, skills, courses, github_url
    Output: missing_fields, tips, club_suggestions, event_suggestions
    """
    supabase = get_supabase()

    # Check 24h cache
    cached_at = current_user.get("ai_analysis_updated_at")
    cached_result = current_user.get("ai_analysis_cache")
    if cached_at and cached_result:
        try:
            updated = datetime.fromisoformat(cached_at.replace("Z", "+00:00"))
            if datetime.now(updated.tzinfo) - updated < timedelta(hours=24):
                return AIAnalysisResponse(**json.loads(cached_result))
        except Exception:
            pass

    # Build profile summary for AI
    profile_summary = {
        "name": current_user.get("name", ""),
        "department": current_user.get("department", ""),
        "year": current_user.get("year", ""),
        "skills": current_user.get("skills", []),
        "courses": current_user.get("courses", []),
        "github_url": current_user.get("github_url", ""),
        "bio": current_user.get("bio", ""),
    }

    # Check missing fields
    missing_fields = []
    if not profile_summary["department"]:
        missing_fields.append("department")
    if not profile_summary["year"]:
        missing_fields.append("year")
    if not profile_summary["skills"]:
        missing_fields.append("skills")
    if not profile_summary["courses"]:
        missing_fields.append("courses")
    if not profile_summary["github_url"]:
        missing_fields.append("github_url")
    if not profile_summary["bio"]:
        missing_fields.append("bio")

    # Try OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    tips = []
    club_suggestions = []
    event_suggestions = []

    if openai_api_key:
        try:
            import httpx
            prompt = f"""You are an academic advisor AI for a university platform called CampusConnect.
Analyze this student profile and provide helpful suggestions.

Profile:
- Department: {profile_summary['department'] or 'Not specified'}
- Year: {profile_summary['year'] or 'Not specified'}
- Skills: {', '.join(profile_summary['skills']) if profile_summary['skills'] else 'None listed'}
- Courses: {', '.join(profile_summary['courses']) if profile_summary['courses'] else 'None listed'}
- GitHub: {'Provided' if profile_summary['github_url'] else 'Not provided'}
- Bio: {profile_summary['bio'] or 'Not written'}

Respond ONLY with a JSON object (no markdown) with these exact keys:
{{
  "tips": ["tip1", "tip2", "tip3"],
  "club_suggestions": ["Club Name 1", "Club Name 2"],
  "event_suggestions": ["Event type 1", "Event type 2"]
}}"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_api_key}"},
                    json={
                        "model": "gpt-4o",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 500,
                        "temperature": 0.7,
                    },
                    timeout=15.0,
                )
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"].strip()
                parsed = json.loads(content)
                tips = parsed.get("tips", [])
                club_suggestions = parsed.get("club_suggestions", [])
                event_suggestions = parsed.get("event_suggestions", [])
        except Exception as e:
            print("OpenAI error:", e)
            # Fallback tips
            tips = [
                "Complete your profile with your department and year.",
                "Add your skills to get better project suggestions.",
                "Link your GitHub profile to showcase your work.",
            ]
    else:
        # No API key — generic tips based on missing fields
        if "skills" in missing_fields:
            tips.append("Add your skills to get matched with relevant projects and clubs.")
        if "github_url" in missing_fields:
            tips.append("Link your GitHub profile to showcase your work to other students.")
        if "bio" in missing_fields:
            tips.append("Write a short bio to introduce yourself to the community.")
        if "courses" in missing_fields:
            tips.append("Add your current courses to find relevant study groups.")
        if not tips:
            tips = ["Your profile looks great! Keep it updated as you learn new skills."]
        club_suggestions = ["Programming Club", "AI & ML Society", "Open Source Contributors"]
        event_suggestions = ["Hackathon", "Tech Talk", "Study Session"]

    result = AIAnalysisResponse(
        missing_fields=missing_fields,
        tips=tips,
        club_suggestions=club_suggestions,
        event_suggestions=event_suggestions,
    )

    # Cache result in DB
    try:
        supabase.table("users").update({
            "ai_analysis_cache": json.dumps(result.model_dump()),
            "ai_analysis_updated_at": datetime.utcnow().isoformat(),
        }).eq("id", current_user["id"]).execute()
    except Exception as e:
        print("Cache save error:", e)

    return result