from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.database import PyObjectId

class UserRegister(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    password: str
    language: Optional[str] = "en"
    role: str = Field(default="citizen", pattern="^(citizen|officer|admin)$")

class UserAdminCreate(BaseModel):
    """Used only by an authenticated admin to create officer/admin accounts."""
    name: str
    mobile: str
    email: EmailStr
    password: str
    language: Optional[str] = "en"
    role: str = Field(..., pattern="^(citizen|officer|admin)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    language: Optional[str] = None
    profile_image: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    name: str
    mobile: str
    email: EmailStr
    role: str
    language: str
    profile_image: Optional[str] = ""
    created_at: datetime

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse