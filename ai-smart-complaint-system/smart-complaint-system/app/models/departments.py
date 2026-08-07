from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Union
from pydantic import BaseModel, Field
from app.database import db
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/departments", tags=["Infrastructure Departments"])

# --- Pydantic Data Validation Schemas ---
class DepartmentName(BaseModel):
    en: str = Field(..., example="Water Management")
    te: str = Field(..., example="నీటి సరఫరా")

class DepartmentCreatePayload(BaseModel):
    id: str = Field(..., example="water")
    name: DepartmentName
    icon: str = Field(default="Building2", example="Droplet")
    color: str = Field(default="#3b82f6", example="#0ea5e9")
    bg: str = Field(default="#eff6ff", example="#f0f9ff")

class DepartmentResponse(BaseModel):
    id: str
    name: Union[Dict[str, str], str]
    icon: str
    color: str
    bg: str

    class Config:
        populate_by_name = True

# --- API Route Endpoints ---

@router.get("/departments", response_model=List[DepartmentResponse])
async def get_all_departments(current_user: dict = Depends(get_current_user)):
    try:
        raw_depts = await db.departments.find({}).to_list(length=100)
        
        formatted_depts = []
        for d in raw_depts:
            # Manually convert the MongoDB ObjectId to a string
            dept_id = str(d.get("_id")) 
            
            formatted_depts.append({
                "id": dept_id,  # Use the string version
                "name": d.get("name") or {"en": "Unknown", "te": "తెలియదు"},
                "icon": d.get("icon", "Building2"),
                "color": d.get("color", "#3b82f6"),
                "bg": d.get("bg", "#eff6ff")
            })
        return formatted_depts
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Database error: {str(e)}"
        )
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_department(payload: DepartmentCreatePayload, current_user: dict = Depends(get_current_user)):
    """
    Onboards a brand new department channel node into the infrastructure.
    Enforces administrative validation role controls.
    """
    user_role = str(current_user.get("role", "citizen")).strip().lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative access clearance required."
        )
        
    dept_id = payload.id.strip().lower()
    if not dept_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Unique Routing Key String (ID) cannot be empty."
        )

    # Check for duplicate unique cluster keys
    existing = await db.departments.find_one({"_id": dept_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Department mapping key already exists."
        )

    # Format explicitly for MongoDB document structure layout
    document = {
        "_id": dept_id,
        "id": dept_id,
        "name": payload.name.model_dump(),
        "icon": payload.icon,
        "color": payload.color,
        "bg": payload.bg
    }
    
    await db.departments.insert_one(document)
    return {"message": "Department cluster spawned successfully", "id": dept_id}


@router.put("/{dept_id}")
async def update_department(dept_id: str, payload: DepartmentCreatePayload, current_user: dict = Depends(get_current_user)):
    """
    Modifies an existing department configuration layout block.
    """
    user_role = str(current_user.get("role", "citizen")).strip().lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative access clearance required."
        )
        
    target_id = dept_id.strip().lower()
    
    existing = await db.departments.find_one({"_id": target_id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Target department channel node not found."
        )

    update_doc = {
        "name": payload.name.model_dump(),
        "icon": payload.icon,
        "color": payload.color,
        "bg": payload.bg
    }

    await db.departments.update_one({"_id": target_id}, {"$set": update_doc})
    return {"message": "Department cluster configurations updated successfully"}


@router.delete("/{dept_id}")
async def delete_department(dept_id: str, current_user: dict = Depends(get_current_user)):
    """
    Purges a department category from active routing nodes.
    Prevented for fallback category 'other'.
    """
    user_role = str(current_user.get("role", "citizen")).strip().lower()
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative access clearance required."
        )
        
    target_id = dept_id.strip().lower()
    if target_id == "other":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="System Guardrail: Fallback channel 'other' is locked permanently."
        )

    result = await db.departments.delete_one({"_id": target_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Target department channel node not found."
        )
        
    return {"message": "Department node successfully purged from index metrics"}