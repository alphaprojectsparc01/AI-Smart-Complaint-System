from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from typing import List
from datetime import datetime, timezone
from app.database import db
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Public Services & Tracking"])

@router.get("/departments")
async def get_departments():
    return await db.departments.find({"is_active": True}).to_list(length=50)

@router.get("/departments/{id}")
async def get_department(id: str):
    return await db.departments.find_one({"_id": ObjectId(id)})

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    return await db.notifications.find({"user_id": current_user["_id"]}).to_list(length=50)

@router.put("/notifications/read/{id}")
async def mark_notification_read(id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"_id": ObjectId(id)}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

@router.get("/emergency")
async def get_emergency_contacts():
    return await db.emergency_contacts.find({}).to_list(length=50)

@router.get("/tracking/{complaint_id}")
async def track_complaint(complaint_id: str):
    return await db.complaints.find_one({"complaint_id": complaint_id}, {"status": 1, "updated_at": 1})

@router.get("/history/{complaint_id}")
async def get_complaint_history(complaint_id: str):
    # Lookup history using the dynamic human-readable string ID or ObjectId mapping
    return await db.complaint_history.find({"complaint_id": complaint_id}).to_list(length=50)