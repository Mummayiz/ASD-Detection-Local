from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import joblib
import numpy as np
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Global variables for models
models = {}
scalers = {}
encoders = {}

def load_models():
    """Load ML models"""
    global models, scalers, encoders
    
    try:
        logger.info("Loading ML models...")
        
        # Determine model path
        if os.path.exists('/app/models/'):
            model_path = '/app/models/'
        elif os.path.exists('models/'):
            model_path = 'models/'
        else:
            logger.error("Models directory not found!")
            return False
        
        logger.info(f"Using model path: {model_path}")
        
        # Load behavioral models
        models['behavioral_rf'] = joblib.load(f'{model_path}behavioral_rf_model.joblib')
        models['behavioral_svm'] = joblib.load(f'{model_path}behavioral_svm_model.joblib')
        scalers['behavioral'] = joblib.load(f'{model_path}behavioral_scaler.joblib')
        encoders['behavioral'] = joblib.load(f'{model_path}behavioral_label_encoder.joblib')
        
        logger.info("✅ Models loaded successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {str(e)}")
        return False

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    load_models()

@app.get("/")
async def read_root():
    """Serve the React frontend"""
    return FileResponse('frontend/build/index.html')

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(models),
        "server_version": "1.0.1"
    }

@app.post("/api/assessment/behavioral")
async def assess_behavioral(data: BehavioralAssessment):
    """Behavioral assessment with ML models"""
    logger.info(f"Received behavioral assessment request: {data}")
    
    try:
        # Check if models are loaded
        if 'behavioral_rf' not in models or 'behavioral_svm' not in models:
            logger.warning("Models not loaded, using fallback assessment")
            # Fallback to simple rule-based assessment
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
                    'method': 'fallback_rule_based',
                    'total_score': total_score,
                    'threshold': 6
                },
                'explanation': {
                    'method': 'Simple rule-based assessment (models not loaded)',
                    'total_score': total_score,
                    'threshold_used': 6,
                    'reasoning': f'Total score {total_score} {"≥" if total_score >= 6 else "<"} 6 threshold'
                },
                'timestamp': datetime.now().isoformat()
            }
        
        # Use ML models
        logger.info("Using ML models for prediction...")
        
        # Prepare features
        features = np.array([[
            data.A1_Score, data.A2_Score, data.A3_Score, data.A4_Score, data.A5_Score,
            data.A6_Score, data.A7_Score, data.A8_Score, data.A9_Score, data.A10_Score,
            data.age, 1 if data.gender == 'm' else 0  # Encoded gender
        ]])
        
        # Scale features
        features_scaled = scalers['behavioral'].transform(features)
        
        # Make predictions
        rf_pred = models['behavioral_rf'].predict_proba(features_scaled)[0]
        svm_pred = models['behavioral_svm'].predict_proba(features_scaled)[0]
        
        # Simple ensemble (equal weights)
        ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
        ensemble_pred = 1 if ensemble_prob > 0.5 else 0
        
        logger.info(f"RF prediction: {rf_pred}, SVM prediction: {svm_pred}")
        logger.info(f"Ensemble prediction: {ensemble_pred}, probability: {ensemble_prob}")
        
        return {
            'prediction': int(ensemble_pred),
            'probability': float(ensemble_prob),
            'confidence': float(ensemble_prob),
            'model_results': {
                'random_forest': {'probability': float(rf_pred[1]), 'prediction': int(rf_pred[1] > 0.5)},
                'svm': {'probability': float(svm_pred[1]), 'prediction': int(svm_pred[1] > 0.5)},
                'ensemble': {'probability': float(ensemble_prob), 'prediction': int(ensemble_pred), 'method': 'simple_average'}
            },
            'explanation': {
                'method': 'ML ensemble (Random Forest + SVM)',
                'rf_probability': float(rf_pred[1]),
                'svm_probability': float(svm_pred[1]),
                'ensemble_probability': float(ensemble_prob),
                'reasoning': f'Ensemble probability {ensemble_prob:.3f} {"≥" if ensemble_prob > 0.5 else "<"} 0.5 threshold'
            },
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in behavioral assessment: {str(e)}")
        return {
            'prediction': 0,
            'probability': 0.5,
            'confidence': 0.5,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

if __name__ == "__main__":
    print("Starting fixed server with ML models...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
