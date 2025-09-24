from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for behavioral data
class BehavioralAssessment(BaseModel):
    A1_Score: float = 0.0
    A2_Score: float = 0.0
    A3_Score: float = 0.0
    A4_Score: float = 0.0
    A5_Score: float = 0.0
    A6_Score: float = 0.0
    A7_Score: float = 0.0
    A8_Score: float = 0.0
    A9_Score: float = 0.0
    A10_Score: float = 0.0
    age: int = 25
    gender: str = "m"

# Serve static files from frontend build
try:
    app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
except Exception as e:
    print(f"Could not mount static files: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    """Serve the React frontend"""
    try:
        return FileResponse('frontend/build/index.html')
    except Exception as e:
        return {"message": "ASD Detection API - Railway Ready", "error": str(e)}

# API Endpoints
@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: BehavioralAssessment):
    """Behavioral assessment endpoint"""
    # Simple rule-based assessment for now
    total_score = sum([
        data.A1_Score, data.A2_Score, data.A3_Score, data.A4_Score, data.A5_Score,
        data.A6_Score, data.A7_Score, data.A8_Score, data.A9_Score, data.A10_Score
    ])
    
    prediction = 1 if total_score >= 6 else 0
    confidence = min(0.95, 0.5 + (total_score / 10) * 0.4)
    
    return {
        'prediction': prediction,
        'probability': confidence,
        'confidence': confidence,
        'model_results': {
            'method': 'rule_based',
            'total_score': total_score,
            'threshold': 6
        },
        'explanation': {
            'method': 'Simple rule-based assessment',
            'total_score': total_score,
            'threshold_used': 6,
            'reasoning': f'Total score {total_score} {"≥" if total_score >= 6 else "<"} 6 threshold'
        },
        'timestamp': '2024-01-01T00:00:00'
    }

@app.post("/api/assessment/eye_tracking")
async def assess_eye_tracking(data: dict):
    """Eye tracking assessment endpoint"""
    return {
        'prediction': 0,
        'probability': 0.3,
        'confidence': 0.3,
        'model_results': {'method': 'mock'},
        'explanation': {'reasoning': 'Mock response'},
        'timestamp': '2024-01-01T00:00:00'
    }

@app.post("/api/assessment/facial_analysis")
async def assess_facial_analysis(data: dict):
    """Facial analysis assessment endpoint"""
    return {
        'prediction': 0,
        'probability': 0.3,
        'confidence': 0.3,
        'model_results': {'method': 'mock'},
        'explanation': {'reasoning': 'Mock response'},
        'timestamp': '2024-01-01T00:00:00'
    }

@app.post("/api/assessment/complete")
async def complete_assessment(data: dict):
    """Complete assessment endpoint"""
    return {
        'final_prediction': 0,
        'confidence_score': 0.3,
        'explanation': {'reasoning': 'Mock response'},
        'timestamp': '2024-01-01T00:00:00'
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
