from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(title="ASD Detection API", version="1.0.1")

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

@app.get("/")
async def read_root():
    """Serve the React frontend"""
    return FileResponse('frontend/build/index.html')

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "server_version": "1.0.1",
        "message": "Simple test server running"
    }

@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: BehavioralAssessment):
    """Simple behavioral assessment without ML models"""
    print(f"Received data: {data}")
    
    # Simple rule-based assessment
    total_score = sum([
        data.A1_Score, data.A2_Score, data.A3_Score, data.A4_Score, data.A5_Score,
        data.A6_Score, data.A7_Score, data.A8_Score, data.A9_Score, data.A10_Score
    ])
    
    # Simple threshold-based prediction
    prediction = 1 if total_score >= 6 else 0
    confidence = min(0.95, 0.5 + (total_score / 10) * 0.4)
    
    print(f"Total score: {total_score}, Prediction: {prediction}")
    
    return {
        'prediction': prediction,
        'probability': confidence,
        'confidence': confidence,
        'model_results': {
            'method': 'simple_rule_based',
            'total_score': total_score,
            'threshold': 6
        },
        'explanation': {
            'method': 'Simple rule-based assessment',
            'total_score': total_score,
            'threshold_used': 6,
            'reasoning': f'Total score {total_score} {"≥" if total_score >= 6 else "<"} 6 threshold'
        },
        'timestamp': '2025-01-01T00:00:00'
    }

if __name__ == "__main__":
    print("Starting simple test server...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
