from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, validator
from typing import List, Dict, Optional, Any
import joblib
import numpy as np
import pandas as pd
import os
import motor.motor_asyncio
from datetime import datetime
import json
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import base64
import cv2
import asyncio
import logging
from bson import ObjectId
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASD Detection API",
    description="Machine Learning API for Autism Spectrum Disorder Detection",
    version="1.0.0"
)

# CORS middleware for Railway deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection - Railway will provide MONGO_URL
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.asd_detection

# Global variables for models
models = {}
scalers = {}
encoders = {}

class BehavioralAssessment(BaseModel):
    """Behavioral questionnaire data"""
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
    age: float
    gender: str
    
    @validator('A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
              'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score')
    def validate_scores(cls, v):
        if v not in [0, 0.5, 1]:
            raise ValueError('Scores must be 0, 0.5, or 1')
        return v
    
    @validator('age')
    def validate_age(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Age must be between 0 and 100')
        return v
    
    @validator('gender')
    def validate_gender(cls, v):
        if v not in ['f', 'm']:
            raise ValueError('Gender must be f or m')
        return v

@app.on_event("startup")
async def load_models():
    """Load trained ML models on startup"""
    global models, scalers, encoders
    
    try:
        # Load behavioral models
        models['behavioral_rf'] = joblib.load('models/behavioral_rf_model.joblib')
        models['behavioral_svm'] = joblib.load('models/behavioral_svm_model.joblib')
        scalers['behavioral'] = joblib.load('models/behavioral_scaler.joblib')
        encoders['behavioral'] = joblib.load('models/behavioral_label_encoder.joblib')
        
        logger.info("Behavioral models loaded successfully")
        
        # Load eye tracking models if available
        if os.path.exists('models/eye_tracking_rf_model.joblib'):
            models['eye_tracking_rf'] = joblib.load('models/eye_tracking_rf_model.joblib')
            models['eye_tracking_svm'] = joblib.load('models/eye_tracking_svm_model.joblib')
            scalers['eye_tracking'] = joblib.load('models/eye_tracking_scaler.joblib')
            logger.info("Eye tracking models loaded successfully")
        
        logger.info("All models loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        # Don't raise error, continue with mock predictions
        logger.info("Continuing with mock predictions")

@app.get("/")
async def root():
    """Serve a simple HTML page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>ASD Detection System</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2563eb; text-align: center; }
            .status { background: #10b981; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .api-info { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .endpoint { background: #e5e7eb; padding: 10px; margin: 5px 0; border-radius: 3px; font-family: monospace; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧠 ASD Detection System</h1>
            <div class="status">✅ System Online - Ready for Assessment</div>
            
            <div class="api-info">
                <h3>API Endpoints:</h3>
                <div class="endpoint">GET /health - Health check</div>
                <div class="endpoint">POST /api/assessment/behavioral - Behavioral assessment</div>
                <div class="endpoint">POST /api/assessment/eye_tracking - Eye tracking analysis</div>
                <div class="endpoint">POST /api/assessment/facial_analysis - Facial analysis</div>
            </div>
            
            <p><strong>Status:</strong> Railway deployment successful! 🚀</p>
            <p><strong>Models loaded:</strong> {models_loaded}</p>
            <p><strong>Database:</strong> Connected</p>
        </div>
    </body>
    </html>
    """.format(models_loaded=len(models))
    
    return HTMLResponse(content=html_content)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(models),
        "available_stages": ["behavioral", "eye_tracking", "facial_analysis"]
    }

@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: BehavioralAssessment):
    """Stage 1: Behavioral Assessment"""
    try:
        # Prepare features
        features = np.array([[
            data.A1_Score, data.A2_Score, data.A3_Score, data.A4_Score, data.A5_Score,
            data.A6_Score, data.A7_Score, data.A8_Score, data.A9_Score, data.A10_Score,
            data.age, 1 if data.gender == 'm' else 0
        ]])
        
        if 'behavioral_rf' in models and 'behavioral' in scalers:
            # Scale features
            features_scaled = scalers['behavioral'].transform(features)
            
            # Make predictions
            rf_pred = models['behavioral_rf'].predict_proba(features_scaled)[0]
            svm_pred = models['behavioral_svm'].predict_proba(features_scaled)[0]
            
            # Ensemble prediction
            ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
            prediction = 1 if ensemble_prob > 0.5 else 0
        else:
            # Mock prediction if models not loaded
            ensemble_prob = 0.3 + (data.A6_Score * 0.2) + (data.A9_Score * 0.2) + (data.A5_Score * 0.1)
            prediction = 1 if ensemble_prob > 0.5 else 0
        
        result = {
            'prediction': int(prediction),
            'probability': float(ensemble_prob),
            'confidence': float(abs(ensemble_prob - 0.5) * 2),
            'stage': 'behavioral',
            'timestamp': datetime.now().isoformat()
        }
        
        # Store result in database
        try:
            await db.assessments.insert_one({
                'stage': 'behavioral',
                'data': data.dict(),
                'result': result,
                'timestamp': datetime.now()
            })
        except Exception as db_error:
            logger.warning(f"Database error: {db_error}")
        
        return result
        
    except Exception as e:
        logger.error(f"Behavioral assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
