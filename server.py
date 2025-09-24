from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASD Detection API",
    description="API for ASD Detection using ML models",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (React build)
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

@app.get("/")
async def serve_frontend():
    """Serve the React frontend"""
    return FileResponse("frontend/build/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "message": "ASD Detection API is running"
    }

@app.get("/api/health")
async def api_health_check():
    """API Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "message": "ASD Detection API is running"
    }

# Pydantic models for request data
class BehavioralData(BaseModel):
    A1_Score: float
    A2_Score: float
    A3_Score: float
    A4_Score: float
    A5_Score: float
    A6_Score: float
    A7_Score: float
    A8_Score: float
    A9_Score: float
    A10_Score: float
    age: int
    gender: str

# Basic API endpoints for frontend
@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: BehavioralData):
    """Basic behavioral assessment endpoint"""
    return {
        "status": "success",
        "message": "Behavioral assessment completed",
        "prediction": "Assessment completed",
        "confidence": 0.85,
        "explanation": {
            "feature_analysis": {
                "age": {"value": data.age, "importance": 0.3},
                "gender_encoded": {"value": 1 if data.gender == 'm' else 0, "importance": 0.2}
            }
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/assessment/eye_tracking")
async def assess_eye_tracking():
    """Basic eye tracking assessment endpoint"""
    return {
        "status": "success", 
        "message": "Eye tracking assessment completed",
        "prediction": "Assessment completed",
        "confidence": 0.80,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/assessment/facial_analysis")
async def assess_facial_analysis():
    """Basic facial analysis assessment endpoint"""
    return {
        "status": "success",
        "message": "Facial analysis assessment completed", 
        "prediction": "Assessment completed",
        "confidence": 0.75,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    logger.info(f"Starting server on port {port}")
    logger.info("Server configuration complete")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
