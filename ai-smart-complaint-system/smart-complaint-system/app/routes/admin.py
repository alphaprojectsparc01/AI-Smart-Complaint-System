from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from app.database import db
from app.auth.dependencies import get_current_user
from app.models.departments import DepartmentCreatePayload, DepartmentResponse 

# We do not define prefix here because it is handled in main.py
router = APIRouter(tags=["Infrastructure Departments & Admin"])


@router.get("/departments", response_model=List[DepartmentResponse])
async def get_all_departments(current_user: dict = Depends(get_current_user)):
    raw_depts = await db.departments.find({}).to_list(length=100)
    
    formatted_depts = []
    for d in raw_depts:
        # Normalize _id to id string representation safely
        if "_id" in d:
            d["id"] = str(d["_id"])
        formatted_depts.append(d)
    return formatted_depts


@router.post("/departments", status_code=status.HTTP_201_CREATED)
async def create_department(payload: DepartmentCreatePayload, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrative access clearance required.")
        
    dept_id = payload.id.strip().lower()
    if await db.departments.find_one({"_id": dept_id}) or await db.departments.find_one({"id": dept_id}):
        raise HTTPException(status_code=400, detail="Department mapping key already exists.")

    document = payload.model_dump()
    document["_id"] = dept_id
    
    await db.departments.insert_one(document)
    return {"message": "Department cluster spawned successfully", "id": dept_id}


@router.put("/departments/{dept_id}")
async def admin_update_department(dept_id: str, payload: DepartmentCreatePayload, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrative access clearance required.")
        
    target = dept_id.strip().lower()
    update_data = payload.model_dump()
    update_data.pop("id", None) 
    
    # Try updating by string key or ObjectId hex representation
    result = await db.departments.update_one({"id": target}, {"$set": update_data})
    if result.matched_count == 0:
        result = await db.departments.update_one({"_id": target}, {"$set": update_data})
    
    if result.matched_count == 0 and len(target) == 24:
        try:
            result = await db.departments.update_one({"_id": ObjectId(target)}, {"$set": update_data})
        except Exception:
            pass

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department profile reference not found.")
        
    return {"message": "Department configurations modified successfully."}


@router.delete("/departments/{dept_id}")
async def admin_delete_department(dept_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrative access clearance required.")
        
    target = dept_id.strip().lower()
    if target == "other":
        raise HTTPException(status_code=400, detail="System Error: Cannot delete core fallback channel.")
        
    # Attempt deletion matching string 'id', string '_id', or BSON ObjectId
    result = await db.departments.delete_one({"id": target})
    if result.deleted_count == 0:
        result = await db.departments.delete_one({"_id": target})
        
    if result.deleted_count == 0 and len(target) == 24:
        try:
            result = await db.departments.delete_one({"_id": ObjectId(target)})
        except Exception:
            pass

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department target entry not found.")
        
    return {"message": "Department node dropped from city collections."}