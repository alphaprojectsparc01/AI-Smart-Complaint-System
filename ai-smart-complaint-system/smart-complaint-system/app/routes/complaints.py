import shutil
import uuid
import math
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import db
from app.models.complaints import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.auth.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from typing import Optional

router = APIRouter(tags=["Complaints"])

UPLOAD_DIR = Path("/tmp/uploads/complaints")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def auto_assign_closest_officer(
    complaint_db_id: ObjectId, 
    dept_id: str, 
    c_lat: float, 
    c_lng: float,
    ai_predicted_officer: Optional[dict] = None
) -> Optional[dict]:
    normalized_dept = dept_id.strip().lower()
    query = {"department_id": normalized_dept, "is_active": True}
    candidates = await db.officers.find(query).to_list(length=100)
    
    if not candidates and ai_predicted_officer:
        target_phone = str(ai_predicted_officer.get("phone", "9000000000")).strip()
        existing_officer = await db.officers.find_one({"phone": target_phone})
        if existing_officer:
            candidates = [existing_officer]

    best_candidate = None
    lowest_weighted_cost = float('inf')
    
    for officer in candidates:
        distance = calculate_haversine_distance(c_lat, c_lng, officer["latitude"], officer["longitude"])
        tasks_count = officer.get("active_tasks", 0)
        weighted_cost = (distance * 0.7) + (tasks_count * 1.5)
        
        if weighted_cost < lowest_weighted_cost:
            lowest_weighted_cost = weighted_cost
            best_candidate = officer

    if best_candidate:
        officer_id = best_candidate["_id"]
        await db.complaints.update_one(
            {"_id": complaint_db_id},
            {"$set": {"assigned_officer": officer_id, "status": "In Progress"}}
        )
        await db.officers.update_one(
            {"_id": officer_id},
            {"$inc": {"active_tasks": 1}}
        )
        
        await db.complaint_history.insert_one({
            "complaint_id": str(complaint_db_id),
            "status": "In Progress",
            "remarks": f"AI Dispatcher successfully attached ticket to officer {best_candidate['name']} ({best_candidate['phone']})",
            "updated_by": "SYSTEM_AI_ENGINE",
            "created_at": datetime.now(timezone.utc)
        })
        return best_candidate
        
    return None


@router.post("/upload-image")
async def upload_complaint_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    image_url = f"/static/complaints/{filename}"
    return {"image_url": image_url}


@router.get("/public")
async def get_public_complaints(): # Removed or relaxed any user dependencies if needed for public view
    # Fetches all complaints globally across the entire system, sorted by newest first
    complaints = await db.complaints.find({}).sort("created_at", -1).to_list(length=100)
    public_data = []
    for c in complaints:
        public_data.append({
            "id": str(c.get("_id")),
            "complaint_id": c.get("complaint_id"),
            "title": c.get("title") or c.get("category"),
            "category": c.get("category"),
            "department_id": c.get("department_id"),
            "status": c.get("status"),
            "image_url": c.get("image_url", ""),
            "address": c.get("address", ""),
            "created_at": c.get("created_at").isoformat() if c.get("created_at") else None,
        })
    return public_data


@router.get("/stats")
async def get_complaint_stats():
    # Global overview metrics across the entire application database
    total = await db.complaints.count_documents({})
    pending = await db.complaints.count_documents({"status": "Pending"})
    in_progress = await db.complaints.count_documents({"status": "In Progress"})
    resolved = await db.complaints.count_documents({"status": "Resolved"})

    pipeline = [
        {"$group": {"_id": "$department_id", "count": {"$sum": 1}}}
    ]
    dept_counts_cursor = db.complaints.aggregate(pipeline)
    dept_counts = {doc["_id"]: doc["count"] async for doc in dept_counts_cursor if doc["_id"]}

    return {
        "total": total,
        "pending": pending,
        "inProgress": in_progress,
        "resolved": resolved,
        "byDepartment": dept_counts,
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_complaint(data: ComplaintCreate, current_user: dict = Depends(get_current_user)):
    if str(data.department_id).lower().strip() == "other" or str(data.category).lower().strip() == "other":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission Denied: Irrelevant data submissions are filtered by system guardrails."
        )

    count = await db.complaints.count_documents({})
    complaint_id = f"ASC2026{count+1:05d}"

    complaint_dict = data.model_dump()
    complaint_dict.update({
        "complaint_id": complaint_id,
        "user_id": current_user["_id"],
        "status": "Pending",
        "assigned_officer": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    
    insert_result = await db.complaints.insert_one(complaint_dict)

    try:
        ai_officer_context = None
        if data.ai_result and hasattr(data.ai_result, 'predicted_officer'):
            ai_officer_context = data.ai_result.predicted_officer
        elif isinstance(data.ai_result, dict) and "predicted_officer" in data.ai_result:
            ai_officer_context = data.ai_result["predicted_officer"]

        await auto_assign_closest_officer(
            complaint_db_id=insert_result.inserted_id,
            dept_id=data.department_id,
            c_lat=float(data.latitude),
            c_lng=float(data.longitude),
            ai_predicted_officer=ai_officer_context
        )
    except Exception as dispatch_err:
        print(f"Background dispatcher routing warning caught safely: {str(dispatch_err)}")

    await db.complaint_history.insert_one({
        "complaint_id": complaint_id,
        "status": "Pending",
        "remarks": "Complaint submitted by citizen",
        "updated_by": current_user["_id"],
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Complaint filed successfully", "complaint_id": complaint_id}


@router.get("", response_model=List[ComplaintResponse])
async def get_all_complaints(
    mobile: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    user_role = str(current_user.get("role", "citizen")).strip().lower()
    
    # If a mobile parameter is explicitly passed, query by mobile (or related user fields)
    if mobile:
        # First, find if any users or records match this mobile number
        matching_user = await db.users.find_one({"mobile": mobile})
        if matching_user:
            query = {"user_id": matching_user["_id"]}
        else:
            # Fallback query if mobile is stored directly in complaint documents
            query = {"mobile": mobile}
    elif user_role in ["admin", "officer"]:
        query = {}
    else:
        query = {"user_id": current_user["_id"]}
        
    return await db.complaints.find(query).to_list(length=100)

@router.get("/{id}", response_model=Dict[str, Any])
async def get_complaint_by_id(id: str, current_user: dict = Depends(get_current_user)):
    complaint = None
    if len(id) == 24 and all(c in "0123456789abcdefABCDEF" for c in id):
        try:
            complaint = await db.complaints.find_one({"_id": ObjectId(id)})
        except Exception:
            pass
            
    if not complaint:
        complaint = await db.complaints.find_one({"complaint_id": id.strip().upper()})
        
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint record reference not found.")
        
    officer_details = None
    if complaint.get("assigned_officer"):
        try:
            officer_doc = await db.officers.find_one({"_id": ObjectId(complaint["assigned_officer"])})
            if officer_doc:
                officer_details = {
                    "id": str(officer_doc["_id"]),
                    "name": officer_doc.get("name", "Field Engineer"),
                    "rank": officer_doc.get("rank", "Inspector"),
                    "phone": officer_doc.get("phone", "N/A"),
                    "area": officer_doc.get("area", "")
                }
        except Exception as e:
            print(f"Warning mapping officer reference keys: {str(e)}")

    history_logs = await db.complaint_history.find({"complaint_id": str(complaint["_id"])}).sort("created_at", 1).to_list(length=20)
    
    complaint["_id"] = str(complaint["_id"])
    complaint["user_id"] = str(complaint["user_id"])
    complaint["assigned_officer"] = officer_details  
    
    for log in history_logs:
        log["_id"] = str(log["_id"])
        log["complaint_id"] = str(log["complaint_id"])
        log["updated_by"] = str(log["updated_by"])
        if isinstance(log.get("created_at"), datetime):
            log["created_at"] = log["created_at"].isoformat()

    complaint["history"] = history_logs
    return complaint


@router.put("/{id}")
async def update_complaint(id: str, data: ComplaintUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.complaints.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    return {"message": "Complaint updated successfully"}


@router.delete("/{id}")
async def delete_complaint(id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
         raise HTTPException(status_code=403, detail="Administrative access clearance required.")
    await db.complaints.delete_one({"_id": ObjectId(id)})
    return {"message": "Complaint deleted successfully"}


@router.get("/user/{user_id}", response_model=List[ComplaintResponse])
async def get_complaints_by_user(user_id: str, current_user: dict = Depends(get_current_user)):
    return await db.complaints.find({"user_id": ObjectId(user_id)}).to_list(length=100)
