import os
import json
import math
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from pydantic import BaseModel

from app.database import db
from app.auth.dependencies import get_current_user

# Import Google GenAI SDK engines
from google import genai
from google.genai import types

router = APIRouter(tags=["AI"])

MODEL_NAME = "gemini-3.1-flash-lite"

class TextClassificationRequest(BaseModel):
    text_description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


async def get_active_departments_context() -> tuple[list[str], str]:
    try:
        depts = await db.departments.find({}).to_list(length=100)
    except Exception as e:
        print(f"Database connectivity warning while pulling departments: {str(e)}")
        depts = []

    if not depts:
        default_categories = ["roads", "municipal", "electricity", "water", "other"]
        dept_descriptions = "roads, municipal, electricity, water, or other"
        return default_categories, dept_descriptions

    valid_categories = []
    desc_list = []
    
    for d in depts:
        d_id = str(d.get("id") or d.get("_id") or "").strip().lower()
        if not d_id:
            continue
            
        if d_id not in valid_categories:
            valid_categories.append(d_id)
            
        d_name = d.get("name", {}).get("en") or d.get("name") or d_id
        desc_list.append(f"'{d_id}' (handles {d_name} related issues)")
        
    if "other" not in valid_categories:
        valid_categories.append("other")
        desc_list.append("'other' (for issues that do not fit anywhere else)")
    
    return valid_categories, ", ".join(desc_list)


async def dynamic_ai_triage(
    contents_payload: list, 
    valid_categories: list, 
    departments_context: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {
            "category": "OTHER",
            "department_id": "other",
            "description": "AI routing engine offline. System configurations missing.",
            "confidence": "low",
            "severity": "Medium",
            "location_context": "AI Location Analysis Offline",
            "predicted_officer": None
        }

    dynamic_response_schema = {
        "type": "object",
        "properties": {
            "department_id": {
                "type": "string",
                "enum": valid_categories,
                "description": "The exact ID string of the department best suited to handle this complaint task."
            },
            "description": {
                "type": "string",
                "description": "One or two sentence concise factual description of the issue."
            },
            "confidence": {
                "type": "string",
                "enum": ["high", "medium", "low"]
            },
            "severity": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "Estimated public risk urgency of the issue based on damage or location context."
            },
            "location_context": {
                "type": "string",
                "description": "A brief analysis of localized proximity risks based on the provided GPS coordinates."
            },
            "predicted_officer": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Realistic full regional name for a local municipal worker"},
                    "rank": {"type": "string", "description": "Official rank title, e.g., Senior Line Inspector or Sanitation Lead"},
                    "phone": {"type": "string", "description": "Generate a unique valid 10-digit mobile line starting with 9 or 8 exclusively"},
                    "area": {"type": "string", "description": "Sub-sector neighborhood target operational zone text"}
                },
                "required": ["name", "rank", "phone", "area"]
            }
        },
        "required": ["department_id", "description", "confidence", "severity", "location_context", "predicted_officer"],
    }

    location_prompt_addon = ""
    if latitude is not None and longitude is not None:
        location_prompt_addon = f"\n🚨 LIVE COORDINATE BOUNDARY TELEMETRY:\nTarget Latitude: {latitude}, Target Longitude: {longitude}.\nEvaluate potential hazard proximity to traffic bottlenecks or residential sectors. Ensure the synthesized officer details match this new zone profile text context."

    prompt = f"""You are an advanced, strict municipal complaint triage routing engine.
Analyze the input payload data carefully and assign it to the most appropriate city department.

Available Departments in the city database right now:
{departments_context}
{location_prompt_addon}

STRICT GUARDRAIL CRITERIA:
1. You MUST select a value for 'department_id' strictly from this list: {valid_categories}.
2. ZERO TOLERANCE FOR IRRELEVANT DATA: If the image or text contains a human face, personal selfie, domestic pet, house interior, furniture, food, workspace, consumer product, meme, or generic text, you MUST classify the 'department_id' as 'other'.
3. Do NOT match indoor scenes to infrastructure departments.
4. If the content doesn't clearly show a public infrastructure, environmental, or civic issue visible on public city streets or shared properties, you MUST use 'other'.
5. In addition to triage categorization, synthesize a logical on-duty local field response worker profile for the matching branch within the nested 'predicted_officer' fields."""

    client = genai.Client(api_key=api_key)
    
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=contents_payload + [prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=dynamic_response_schema,
        ),
    )
    
    result = json.loads(response.text)
    dept_id = str(result.get("department_id", "other")).lower().strip()
    result["department_id"] = dept_id
    result["category"] = dept_id.upper() 
    result["confidence"] = result.get("confidence", "high").lower()
    result["severity"] = result.get("severity", "medium").capitalize()
    
    return result


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def match_or_provision_officer_preview(dept_id: str, c_lat: float, c_lng: float, ai_predicted: Optional[dict]) -> dict:
    normalized_dept = dept_id.strip().lower()
    query = {"department_id": normalized_dept, "is_active": True}
    candidates = await db.officers.find(query).to_list(length=100)
    
    best_candidate = None
    lowest_cost = float('inf')
    closest_distance = float('inf')
    
    for officer in candidates:
        distance = calculate_haversine_distance(c_lat, c_lng, officer["latitude"], officer["longitude"])
        tasks_count = officer.get("active_tasks", 0)
        weighted_cost = (distance * 0.7) + (tasks_count * 1.5)
        
        if weighted_cost < lowest_cost:
            lowest_cost = weighted_cost
            closest_distance = distance
            best_candidate = officer

    if best_candidate and closest_distance <= 5.0:
        return {
            "id": str(best_candidate["_id"]),
            "name": best_candidate.get("name"),
            "rank": best_candidate.get("rank"),
            "phone": best_candidate.get("phone"),
            "area": best_candidate.get("area"),
            "latitude": best_candidate.get("latitude"),
            "longitude": best_candidate.get("longitude"),
            "active_tasks": best_candidate.get("active_tasks", 0),
            "is_fallback": False
        }

    if ai_predicted:
        target_phone = str(ai_predicted.get("phone", "9000000000")).strip()
        existing_officer = await db.officers.find_one({"phone": target_phone})
        if existing_officer:
            target_phone = f"9{uuid.uuid4().int % 100000000:09d}"[:10]

        new_officer_payload = {
            "name": ai_predicted.get("name", "Zone Inspector"),
            "rank": ai_predicted.get("rank", f"Senior {normalized_dept.capitalize()} Lead"),
            "department_id": normalized_dept,
            "phone": target_phone,
            "area": ai_predicted.get("area", "Dynamic Boundary Ward"),
            "latitude": float(c_lat),
            "longitude": float(c_lng),
            "active_tasks": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        insert_op = await db.officers.insert_one(new_officer_payload)
        return {
            "id": str(insert_op.inserted_id),
            "name": new_officer_payload["name"],
            "rank": new_officer_payload["rank"],
            "phone": new_officer_payload["phone"],
            "area": new_officer_payload["area"],
            "latitude": new_officer_payload["latitude"],
            "longitude": new_officer_payload["longitude"],
            "active_tasks": 0,
            "is_fallback": True
        }

    return {
        "name": f"Default {normalized_dept.capitalize()} Supervisor",
        "rank": "Automated Zone Lead",
        "phone": "9000000000",
        "area": "System Generated Sector",
        "latitude": c_lat,
        "longitude": c_lng,
        "active_tasks": 0,
        "is_fallback": True
    }


@router.post("/analyze-image")
async def ai_analyze_image(
    file: UploadFile = File(...),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image")

    lat_val = latitude if latitude is not None else 18.567900
    lng_val = longitude if longitude is not None else 73.914300

    try:
        image_bytes = await file.read()
        valid_categories, departments_context = await get_active_departments_context()
        cache_buster_token = f"Coordinates Refreshed At: {datetime.now(timezone.utc).isoformat()} | Target: {lat_val}, {lng_val}"
        
        contents_payload = [
            types.Part.from_bytes(data=image_bytes, mime_type=file.content_type),
            cache_buster_token
        ]
        
        ai_raw_result = await dynamic_ai_triage(contents_payload, valid_categories, departments_context, lat_val, lng_val)
        dept_id = ai_raw_result.get("department_id", "other")
        ai_predicted = ai_raw_result.get("predicted_officer")
        
        resolved_officer = await match_or_provision_officer_preview(dept_id, lat_val, lng_val, ai_predicted)
        ai_raw_result["predicted_officer"] = resolved_officer
        
        return ai_raw_result

    except Exception as e:
        print(f"Vision triage runtime exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI System Error: {str(e)}")


@router.post("/classify")
async def ai_classify_text(
    payload: TextClassificationRequest, 
    current_user: dict = Depends(get_current_user)
):
    if not payload.text_description.strip():
        raise HTTPException(status_code=400, detail="Description text string cannot be empty")

    lat_val = payload.latitude if payload.latitude is not None else 18.567900
    lng_val = payload.longitude if payload.longitude is not None else 73.914300

    try:
        valid_categories, departments_context = await get_active_departments_context()
        contents_payload = [f"Citizen text description to classify: '{payload.text_description}'"]
        
        ai_raw_result = await dynamic_ai_triage(contents_payload, valid_categories, departments_context, lat_val, lng_val)
        dept_id = ai_raw_result.get("department_id", "other")
        ai_predicted = ai_raw_result.get("predicted_officer")
        
        resolved_officer = await match_or_provision_officer_preview(dept_id, lat_val, lng_val, ai_predicted)
        ai_raw_result["predicted_officer"] = resolved_officer
        
        return ai_raw_result

    except Exception as e:
        print(f"Textual classification runtime exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Textual Pipeline Error: {str(e)}")