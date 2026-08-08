from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import the aliased routers (including ai_router)
from app.routes import auth_router, complaints_router, services_router, admin_router, ai_router

app = FastAPI(title="Smart City Grievance Resolution Infrastructure API", version="1.0.0")
origins = [
    "http://localhost:5173",  # Your React frontend URL
]

# Setup Static Files
UPLOAD_DIR = Path("/tmp/uploads/complaints")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static/complaints", StaticFiles(directory="uploads/complaints"), name="complaint_images")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with clear, centralized prefixes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints_router, prefix="/api/complaints", tags=["complaints"])
app.include_router(services_router, prefix="/api/services", tags=["services"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])  # <-- ADDED AI ROUTER PREFIX

@app.get("/")
async def health_check():
    return {"status": "operational", "system": "Grievance API Engine"}
