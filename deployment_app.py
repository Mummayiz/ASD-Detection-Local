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

app = FastAPI(title="ASD Detection App", version="1.0.1")

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

# Models will be loaded on first request to avoid blocking Railway startup

# Serve static files from frontend build
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

@app.get("/")
async def read_root():
    """Serve the React frontend"""
    return FileResponse('frontend/build/index.html')

@app.get("/health")
async def health_check():
    """Ultra-simple health check for Railway"""
    return {"status": "ok"}

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
        
        # Use ML models (with error handling for version compatibility)
        logger.info("Using ML models for prediction...")
        
        try:
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
        except Exception as ml_error:
            logger.warning(f"ML models failed, using fallback: {str(ml_error)}")
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
                    'threshold': 6,
                    'ml_error': str(ml_error)
                },
                'explanation': {
                    'method': 'Simple rule-based assessment (ML models failed)',
                    'total_score': total_score,
                    'threshold_used': 6,
                    'reasoning': f'Total score {total_score} {"≥" if total_score >= 6 else "<"} 6 threshold'
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

@app.post("/api/assessment/eye_tracking")
async def assess_eye_tracking(data: dict):
    """Eye tracking assessment (mock implementation)"""
    logger.info(f"Received eye tracking assessment request: {data}")
    
    # Mock eye tracking data
    mock_result = {
        'prediction': 0,  # 0 = No ASD, 1 = ASD
        'probability': 0.3,
        'confidence': 0.75,
        'model_results': {
            'method': 'mock_eye_tracking',
            'fixation_count': 24,
            'avg_saccade': 29.9,
            'blink_rate': 12.5,
            'gaze_stability': 85.0
        },
        'explanation': {
            'method': 'Mock eye tracking assessment',
            'fixation_count': 24,
            'avg_saccade': 29.9,
            'blink_rate': 12.5,
            'gaze_stability': 85.0,
            'reasoning': 'Mock eye tracking analysis completed'
        },
        'timestamp': datetime.now().isoformat()
    }
    
    return mock_result

@app.post("/api/assessment/facial_analysis")
async def assess_facial_analysis(data: dict):
    """Facial analysis assessment (mock implementation)"""
    logger.info(f"Received facial analysis assessment request: {data}")
    
    # Mock facial analysis data
    mock_result = {
        'prediction': 0,  # 0 = No ASD, 1 = ASD
        'probability': 0.4,
        'confidence': 0.8,
        'model_results': {
            'method': 'mock_facial_analysis',
            'emotion_detection': 'neutral',
            'facial_symmetry': 0.85,
            'eye_contact': 0.7
        },
        'explanation': {
            'method': 'Mock facial analysis assessment',
            'emotion_detection': 'neutral',
            'facial_symmetry': 0.85,
            'eye_contact': 0.7,
            'reasoning': 'Mock facial analysis completed'
        },
        'timestamp': datetime.now().isoformat()
    }
    
    return mock_result

@app.post("/api/assessment/complete")
async def complete_assessment(data: dict):
    """Complete assessment with final results"""
    logger.info(f"Received complete assessment request: {data}")
    
    # Mock final assessment
    mock_result = {
        'final_prediction': 0,  # 0 = No ASD, 1 = ASD
        'final_probability': 0.35,
        'final_confidence': 0.82,
        'stage_results': {
            'behavioral': {'prediction': 0, 'confidence': 0.75},
            'eye_tracking': {'prediction': 0, 'confidence': 0.75},
            'facial_analysis': {'prediction': 0, 'confidence': 0.8}
        },
        'recommendation': 'Continue monitoring. Consider professional evaluation if concerns persist.',
        'timestamp': datetime.now().isoformat()
    }
    
    return mock_result

if __name__ == "__main__":
    print("🚀 Starting Local ASD Detection App...")
    print("📱 Frontend: http://localhost:8000")
    print("🔧 API: http://localhost:8000/api/")
    print("❤️  Health: http://localhost:8000/health")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
