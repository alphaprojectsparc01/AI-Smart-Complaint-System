from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from app.database import db
from app.models.user import UserRegister, UserUpdate, ChangePassword, UserResponse
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    if await db.users.find_one({"email": user_data.email}) or await db.officers.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    
    # This will now correctly capture what the user picked in the dropdown ("admin", "officer", or "citizen")
    selected_role = user_dict.get("role", "citizen").strip().lower()
    
    hashed = hash_password(user_dict["password"])
    user_dict.update({
        "password": hashed,
        "role": selected_role,
        "profile_image": "",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    
    result = await db.users.insert_one(user_dict)
    user_id = result.inserted_id
    
    token = create_access_token(data={"sub": str(user_id), "role": user_dict["role"]})
    
    user_dict["_id"] = str(user_id)
    if "password" in user_dict:
        del user_dict["password"]

    return {
        "message": "User registered successfully", 
        "access_token": token, 
        "token_type": "bearer",
        "user": user_dict
    }


@router.post("/login")
async def login(credentials: OAuth2PasswordRequestForm = Depends()):
    # 1. Find user
    user = await db.users.find_one({"email": credentials.username}) or \
           await db.officers.find_one({"email": credentials.username})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # 2. Generate token
    token = create_access_token(data={"sub": str(user["_id"]), "role": user.get("role", "citizen")})
    
    # 3. Prepare for response (CONVERT _id to string)
    user["_id"] = str(user["_id"]) # REQUIRED: Convert ObjectId to string
    if "password" in user:
        del user["password"]
    
    return {
        "access_token": token, 
        "token_type": "bearer",
        "user": user
    }

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    # Note: get_current_user in dependencies.py should also ensure _id is a string
    return current_user