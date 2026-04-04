from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, LoginResponse, UserPublic, UserUpdate
from app.core.supabase import get_supabase
from app.core.security import create_access_token, get_current_user

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
    supabase = get_supabase()
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        supabase.table("users")
        .update(update_data)
        .eq("id", current_user["id"])
        .execute()
    )
    return result.data[0]


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}