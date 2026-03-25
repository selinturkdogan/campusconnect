from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import LoginRequest, LoginResponse, UserPublic
from app.core.supabase import get_supabase
from app.core.security import create_access_token, get_current_user

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    """
    Login with email and password.
    No sign-up — all accounts are created by the admin.
    Returns JWT with role embedded.
    """
    supabase = get_supabase()

    # Authenticate with Supabase Auth
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception:
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

    # Fetch user record from our users table (contains role, name, etc.)
    result = (
        supabase.table("users")
        .select("id, email, name, role")
        .eq("id", supabase_user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Contact the administrator.",
        )

    user = result.data

    # Create our own JWT with role embedded
    token = create_access_token(
        data={"sub": user["id"], "role": user["role"], "email": user["email"]}
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
    """Returns the currently logged-in user's full profile."""
    return current_user


@router.post("/logout")
def logout():
    """
    Client-side logout — just instruct the client to clear the token.
    JWT is stateless so no server-side invalidation needed.
    """
    return {"message": "Logged out successfully. Please clear your local token."}
