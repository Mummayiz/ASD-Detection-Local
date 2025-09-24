from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASD Detection API",
    description="Machine Learning API for Autism Spectrum Disorder Detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
try:
    app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

@app.get("/")
async def root():
    """Serve the React frontend"""
    try:
        return FileResponse("frontend/build/index.html")
    except Exception as e:
        logger.error(f"Could not serve frontend: {e}")
        return {"message": "ASD Detection API", "error": str(e)}

@app.get("/health")
async def health_check():
    """Ultra simple health check"""
    return {"status": "ok"}

@app.get("/api/")
async def api_root():
    """API root endpoint"""
    return {
        "message": "ASD Detection API",
        "version": "1.0.0",
        "status": "active"
    }

# Mock endpoints for frontend
@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: dict):
    """Mock behavioral assessment"""
    return {
        "prediction": 0,
        "probability": 0.3,
        "confidence": 0.3,
        "model_results": {"method": "mock"},
        "explanation": {"reasoning": "Mock response"},
        "timestamp": "2024-01-01T00:00:00"
    }

@app.post("/api/assessment/eye_tracking")
async def assess_eye_tracking(data: dict):
    """Mock eye tracking assessment"""
    return {
        "prediction": 0,
        "probability": 0.3,
        "confidence": 0.3,
        "model_results": {"method": "mock"},
        "explanation": {"reasoning": "Mock response"},
        "timestamp": "2024-01-01T00:00:00"
    }

@app.post("/api/assessment/facial_analysis")
async def assess_facial_analysis(data: dict):
    """Mock facial analysis assessment"""
    return {
        "prediction": 0,
        "probability": 0.3,
        "confidence": 0.3,
        "model_results": {"method": "mock"},
        "explanation": {"reasoning": "Mock response"},
        "timestamp": "2024-01-01T00:00:00"
    }

@app.post("/api/assessment/complete")
async def complete_assessment(data: dict):
    """Mock complete assessment"""
    return {
        "final_prediction": 0,
        "confidence_score": 0.3,
        "explanation": {"reasoning": "Mock response"},
        "timestamp": "2024-01-01T00:00:00"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"🚀 Starting Minimal ASD Detection Server...")
    logger.info(f"📱 Port: {port}")
    logger.info(f"❤️  Health: http://0.0.0.0:{port}/health")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")