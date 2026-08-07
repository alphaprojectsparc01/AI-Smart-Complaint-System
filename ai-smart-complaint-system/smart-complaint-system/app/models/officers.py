from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.database import PyObjectId

class OfficerCreate(BaseModel):
    name: str = Field(..., description="Full official name of the deployment staff member")
    rank: str = Field(..., description="Technical hierarchy title, e.g., Grid Inspector")
    department_id: str = Field(..., description="The primary functional routing branch key matching MongoDB collections")
    phone: str = Field(..., max_length=10, description="10-digit primary mobile terminal line")
    area: str = Field(..., description="Jurisdiction zone identifier text, e.g., Kharadi Zone")
    latitude: float
    longitude: float
    is_active: bool = True

class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    rank: Optional[str] = None
    department_id: Optional[str] = None
    phone: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class OfficerResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    name: str
    rank: str
    department_id: str
    phone: str
    area: str
    latitude: float
    longitude: float
    active_tasks: int = 0
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True