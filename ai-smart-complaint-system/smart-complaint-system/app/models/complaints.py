from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Dict, Any, Annotated
from datetime import datetime
from app.database import PyObjectId

# Helper function to intercept legacy numeric floats and turn them cleanly into text strings
def cast_to_string(v: Any) -> str:
    if v is None:
        return "low"
    if isinstance(v, (int, float)):
        return str(v)
    return str(v)

# Define an annotated custom string type wrapped with the safe type-casting step
FlexibleString = Annotated[str, BeforeValidator(cast_to_string)]

class AIResult(BaseModel):
    prediction: str
    # FIXED: Accepts both new string enums ('high') and older legacy numeric float/int fields ('94.0') safely
    confidence: FlexibleString  

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "Medium"
    address: str
    landmark: Optional[str] = ""
    mobile: str
    latitude: float
    longitude: float
    department_id: Optional[str] = None
    image_url: Optional[str] = ""
    ai_result: Optional[AIResult] = None

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    complaint_id: str
    user_id: PyObjectId
    title: str
    description: str
    department_id: Optional[str] = None
    category: str
    priority: str
    status: str
    address: str
    landmark: str
    latitude: float
    longitude: float
    mobile: Optional[str] = ""
    image_url: Optional[str] = ""
    ai_result: Optional[AIResult] = None
    assigned_officer: Optional[PyObjectId] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

ComplaintCreate.model_rebuild()