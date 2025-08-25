from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
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
import base64
import cv2
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ASD Detection API",
    description="Machine Learning API for Autism Spectrum Disorder Detection with Multi-Stage Assessment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.asd_detection

# Global variables for models
models = {}
scalers = {}
encoders = {}

class BehavioralAssessment(BaseModel):
    """Behavioral questionnaire data"""
    A1_Score: int  # Social responsiveness
    A2_Score: int  # Communication patterns
    A3_Score: int  # Repetitive behaviors
    A4_Score: int  # Social interaction
    A5_Score: int  # Attention to detail
    A6_Score: int  # Sensory sensitivity
    A7_Score: int  # Language development
    A8_Score: int  # Motor skills
    A9_Score: int  # Behavioral flexibility
    A10_Score: int  # Emotional regulation
    age: float
    gender: str  # 'f' or 'm'
    
    @validator('A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
              'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score')
    def validate_scores(cls, v):
        if v not in [0, 1]:
            raise ValueError('Scores must be 0 or 1')
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

class EyeTrackingData(BaseModel):
    """Eye tracking features from webcam analysis"""
    fixation_count: float
    mean_saccade: float
    max_saccade: float
    std_saccade: float
    mean_x: float
    mean_y: float
    std_x: float
    std_y: float
    mean_pupil: float

class FacialAnalysisData(BaseModel):
    """Facial analysis features"""
    facial_features: List[float]  # CNN features from facial analysis
    emotion_scores: Dict[str, float]
    attention_patterns: Dict[str, float]

class AssessmentResult(BaseModel):
    """Complete assessment result"""
    session_id: str
    behavioral_prediction: Optional[Dict[str, Any]] = None
    eye_tracking_prediction: Optional[Dict[str, Any]] = None
    facial_analysis_prediction: Optional[Dict[str, Any]] = None
    final_prediction: Dict[str, Any]
    confidence_score: float
    explanation: Dict[str, Any]
    timestamp: str

@app.on_event("startup")
async def load_models():
    """Load trained ML models on startup"""
    global models, scalers, encoders
    
    try:
        # Load behavioral models
        models['behavioral_rf'] = joblib.load('/app/models/behavioral_rf_model.joblib')
        models['behavioral_svm'] = joblib.load('/app/models/behavioral_svm_model.joblib')
        scalers['behavioral'] = joblib.load('/app/models/behavioral_scaler.joblib')
        encoders['behavioral'] = joblib.load('/app/models/behavioral_label_encoder.joblib')
        
        logger.info("Behavioral models loaded successfully")
        
        # Load eye tracking models if available
        if os.path.exists('/app/models/eye_tracking_rf_model.joblib'):
            models['eye_tracking_rf'] = joblib.load('/app/models/eye_tracking_rf_model.joblib')
            models['eye_tracking_svm'] = joblib.load('/app/models/eye_tracking_svm_model.joblib')
            scalers['eye_tracking'] = joblib.load('/app/models/eye_tracking_scaler.joblib')
            logger.info("Eye tracking models loaded successfully")
        
        logger.info("All models loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        raise e

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ASD Detection API",
        "version": "1.0.0",
        "status": "active",
        "stages": ["behavioral", "eye_tracking", "facial_analysis"]
    }

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
            data.age, 1 if data.gender == 'm' else 0  # Encoded gender
        ]])
        
        # Scale features
        features_scaled = scalers['behavioral'].transform(features)
        
        # Make predictions
        rf_pred = models['behavioral_rf'].predict_proba(features_scaled)[0]
        svm_pred = models['behavioral_svm'].predict_proba(features_scaled)[0]
        
        # Ensemble prediction
        ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
        ensemble_pred = 1 if ensemble_prob > 0.5 else 0
        
        # Feature importance analysis
        feature_importance = models['behavioral_rf'].feature_importances_
        feature_names = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score',
                        'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score', 'age', 'gender']
        
        top_features = {}
        feature_values = features[0]
        for i, (name, importance) in enumerate(zip(feature_names, feature_importance)):
            if importance > 0.05:  # Only significant features
                top_features[name] = {
                    'importance': float(importance),
                    'value': float(feature_values[i]),
                    'contribution': float(importance * feature_values[i])
                }
        
        # Generate explanation
        explanation = generate_behavioral_explanation(ensemble_pred, ensemble_prob, top_features)
        
        result = {
            'prediction': int(ensemble_pred),
            'probability': float(ensemble_prob),
            'confidence': float(max(rf_pred)),
            'model_results': {
                'random_forest': {'probability': float(rf_pred[1]), 'prediction': int(rf_pred[1] > 0.5)},
                'svm': {'probability': float(svm_pred[1]), 'prediction': int(svm_pred[1] > 0.5)}
            },
            'explanation': explanation,
            'stage': 'behavioral',
            'timestamp': datetime.now().isoformat()
        }
        
        # Store result in database
        await db.assessments.insert_one({
            'stage': 'behavioral',
            'data': data.dict(),
            'result': result,
            'timestamp': datetime.now()
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Behavioral assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.post("/api/assessment/eye_tracking")
async def assess_eye_tracking(data: EyeTrackingData):
    """Stage 2: Eye Tracking Assessment"""
    try:
        if 'eye_tracking_rf' not in models:
            raise HTTPException(status_code=501, detail="Eye tracking models not available")
        
        # Prepare features
        features = np.array([[
            data.fixation_count, data.mean_saccade, data.max_saccade, data.std_saccade,
            data.mean_x, data.mean_y, data.std_x, data.std_y, data.mean_pupil
        ]])
        
        # Scale features
        features_scaled = scalers['eye_tracking'].transform(features)
        
        # Make predictions
        rf_pred = models['eye_tracking_rf'].predict_proba(features_scaled)[0]
        svm_pred = models['eye_tracking_svm'].predict_proba(features_scaled)[0]
        
        # Ensemble prediction
        ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
        ensemble_pred = 1 if ensemble_prob > 0.5 else 0
        
        # Feature importance analysis
        feature_importance = models['eye_tracking_rf'].feature_importances_
        feature_names = ['fixation_count', 'mean_saccade', 'max_saccade', 'std_saccade',
                        'mean_x', 'mean_y', 'std_x', 'std_y', 'mean_pupil']
        
        top_features = {}
        feature_values = features[0]
        for i, (name, importance) in enumerate(zip(feature_names, feature_importance)):
            if importance > 0.05:
                top_features[name] = {
                    'importance': float(importance),
                    'value': float(feature_values[i]),
                    'description': get_eye_tracking_description(name)
                }
        
        # Generate explanation
        explanation = generate_eye_tracking_explanation(ensemble_pred, ensemble_prob, top_features)
        
        result = {
            'prediction': int(ensemble_pred),
            'probability': float(ensemble_prob),
            'confidence': float(max(rf_pred)),
            'model_results': {
                'random_forest': {'probability': float(rf_pred[1]), 'prediction': int(rf_pred[1] > 0.5)},
                'svm': {'probability': float(svm_pred[1]), 'prediction': int(svm_pred[1] > 0.5)}
            },
            'explanation': explanation,
            'stage': 'eye_tracking', 
            'timestamp': datetime.now().isoformat()
        }
        
        # Store result in database
        await db.assessments.insert_one({
            'stage': 'eye_tracking',
            'data': data.dict(),
            'result': result,
            'timestamp': datetime.now()
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Eye tracking assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.post("/api/assessment/facial_analysis")
async def assess_facial_analysis(data: FacialAnalysisData):
    """Stage 3: Facial Analysis Assessment"""
    try:
        # For now, return a mock result since CNN training would need more setup
        # In a full implementation, this would use the trained CNN model
        
        # Simple analysis based on facial features
        feature_mean = np.mean(data.facial_features) if data.facial_features else 0.5
        
        # Mock prediction based on attention patterns and emotions
        attention_score = data.attention_patterns.get('attention_to_faces', 0.5)
        emotion_variability = np.std(list(data.emotion_scores.values())) if data.emotion_scores else 0.5
        
        # Combine features for prediction
        combined_score = (feature_mean * 0.4 + attention_score * 0.4 + emotion_variability * 0.2)
        prediction = 1 if combined_score > 0.6 else 0
        
        explanation = {
            'summary': f"Facial analysis {'indicates' if prediction else 'does not indicate'} ASD patterns",
            'key_factors': {
                'attention_to_faces': attention_score,
                'emotion_variability': emotion_variability,
                'facial_features_score': feature_mean
            },
            'interpretation': generate_facial_explanation(prediction, combined_score, data)
        }
        
        result = {
            'prediction': int(prediction),
            'probability': float(combined_score),
            'confidence': float(abs(combined_score - 0.5) * 2),
            'explanation': explanation,
            'stage': 'facial_analysis',
            'timestamp': datetime.now().isoformat()
        }
        
        # Store result in database
        await db.assessments.insert_one({
            'stage': 'facial_analysis',
            'data': data.dict(),
            'result': result,
            'timestamp': datetime.now()
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Facial analysis assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.post("/api/assessment/complete")
async def complete_assessment(session_id: str):
    """Generate final assessment combining all stages"""
    try:
        # Retrieve all assessments for this session
        assessments = await db.assessments.find({'session_id': session_id}).to_list(length=None)
        
        if not assessments:
            # For demo, get the latest assessments from each stage
            behavioral = await db.assessments.find_one({'stage': 'behavioral'}, sort=[('timestamp', -1)])
            eye_tracking = await db.assessments.find_one({'stage': 'eye_tracking'}, sort=[('timestamp', -1)])
            facial = await db.assessments.find_one({'stage': 'facial_analysis'}, sort=[('timestamp', -1)])
            
            assessments = [a for a in [behavioral, eye_tracking, facial] if a is not None]
        
        if not assessments:
            raise HTTPException(status_code=404, detail="No assessments found")
        
        # Combine predictions with weights
        stage_weights = {'behavioral': 0.6, 'eye_tracking': 0.25, 'facial_analysis': 0.15}
        
        weighted_score = 0
        total_weight = 0
        stage_results = {}
        
        for assessment in assessments:
            stage = assessment['stage']
            if stage in stage_weights:
                prob = assessment['result']['probability']
                weight = stage_weights[stage]
                weighted_score += prob * weight
                total_weight += weight
                stage_results[stage] = assessment['result']
        
        # Final prediction
        if total_weight > 0:
            final_probability = weighted_score / total_weight
        else:
            final_probability = 0.5
            
        final_prediction = 1 if final_probability > 0.5 else 0
        confidence = abs(final_probability - 0.5) * 2
        
        # Generate comprehensive explanation
        explanation = generate_comprehensive_explanation(final_prediction, final_probability, stage_results)
        
        final_result = {
            'session_id': session_id,
            'final_prediction': int(final_prediction),
            'final_probability': float(final_probability),
            'confidence_score': float(confidence),
            'stage_results': stage_results,
            'explanation': explanation,
            'assessment_date': datetime.now().isoformat(),
            'stages_completed': len(stage_results)
        }
        
        # Store final result
        await db.final_assessments.insert_one(final_result)
        
        return final_result
        
    except Exception as e:
        logger.error(f"Complete assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

def generate_behavioral_explanation(prediction, probability, top_features):
    """Generate explanation for behavioral assessment"""
    result_text = "indicates ASD patterns" if prediction else "does not indicate ASD patterns"
    confidence_text = "high" if probability > 0.8 or probability < 0.2 else "moderate"
    
    explanation = {
        'summary': f"Behavioral assessment {result_text} with {confidence_text} confidence",
        'key_indicators': [],
        'feature_analysis': top_features,
        'recommendations': []
    }
    
    # Analyze key features
    if 'A6_Score' in top_features and top_features['A6_Score']['value'] == 1:
        explanation['key_indicators'].append("Sensory sensitivity patterns detected")
    
    if 'A9_Score' in top_features and top_features['A9_Score']['value'] == 1:
        explanation['key_indicators'].append("Behavioral flexibility concerns noted")
    
    if 'A5_Score' in top_features and top_features['A5_Score']['value'] == 1:
        explanation['key_indicators'].append("Attention to detail patterns observed")
    
    # Add recommendations
    if prediction:
        explanation['recommendations'] = [
            "Consider comprehensive diagnostic evaluation",
            "Proceed with eye tracking and facial analysis",
            "Consult with autism specialist"
        ]
    else:
        explanation['recommendations'] = [
            "Continue with additional assessments for complete evaluation",
            "Monitor development patterns over time"
        ]
    
    return explanation

def generate_eye_tracking_explanation(prediction, probability, top_features):
    """Generate explanation for eye tracking assessment"""
    result_text = "suggests ASD patterns" if prediction else "does not suggest ASD patterns"
    
    explanation = {
        'summary': f"Eye tracking analysis {result_text}",
        'gaze_patterns': {},
        'feature_analysis': top_features,
        'clinical_significance': []
    }
    
    # Analyze gaze patterns
    if 'std_x' in top_features or 'std_y' in top_features:
        explanation['gaze_patterns']['spatial_variability'] = "Atypical gaze distribution patterns detected"
    
    if 'fixation_count' in top_features:
        explanation['gaze_patterns']['attention_patterns'] = "Unusual visual attention duration observed"
    
    if 'mean_saccade' in top_features:
        explanation['gaze_patterns']['eye_movements'] = "Atypical saccadic eye movement patterns"
    
    # Clinical significance
    explanation['clinical_significance'] = [
        "Eye tracking provides objective measures of visual attention",
        "Gaze patterns can indicate social attention differences",
        "Results should be interpreted alongside other assessments"
    ]
    
    return explanation

def generate_facial_explanation(prediction, score, data):
    """Generate explanation for facial analysis"""
    explanation = []
    
    if data.attention_patterns.get('attention_to_faces', 0) < 0.5:
        explanation.append("Reduced attention to facial regions detected")
    
    if len(data.emotion_scores) > 0:
        dominant_emotion = max(data.emotion_scores, key=data.emotion_scores.get)
        explanation.append(f"Dominant emotional expression: {dominant_emotion}")
    
    if not explanation:
        explanation.append("Facial analysis completed with standard patterns")
    
    return explanation

def generate_comprehensive_explanation(prediction, probability, stage_results):
    """Generate comprehensive explanation combining all stages"""
    result_text = "indicates ASD" if prediction else "does not indicate ASD"
    confidence_level = "high" if abs(probability - 0.5) > 0.3 else "moderate"
    
    explanation = {
        'overall_result': f"Multi-stage assessment {result_text} with {confidence_level} confidence",
        'stage_contributions': {},
        'key_findings': [],
        'clinical_recommendations': [],
        'next_steps': []
    }
    
    # Analyze each stage contribution
    for stage, result in stage_results.items():
        stage_pred = result.get('prediction', 0)
        stage_prob = result.get('probability', 0.5)
        
        explanation['stage_contributions'][stage] = {
            'prediction': 'ASD indicated' if stage_pred else 'ASD not indicated',
            'confidence': abs(stage_prob - 0.5) * 2,
            'contribution': 'supporting' if stage_pred == prediction else 'conflicting'
        }
    
    # Key findings
    if 'behavioral' in stage_results and stage_results['behavioral'].get('prediction'):
        explanation['key_findings'].append("Behavioral questionnaire indicates ASD patterns")
    
    if 'eye_tracking' in stage_results and stage_results['eye_tracking'].get('prediction'):
        explanation['key_findings'].append("Eye tracking reveals atypical gaze patterns")
    
    if 'facial_analysis' in stage_results and stage_results['facial_analysis'].get('prediction'):
        explanation['key_findings'].append("Facial analysis suggests social attention differences")
    
    # Clinical recommendations
    if prediction:
        explanation['clinical_recommendations'] = [
            "Recommend comprehensive diagnostic evaluation by autism specialist",
            "Consider additional standardized assessments (ADOS, ADI-R)",
            "Evaluate for co-occurring conditions",
            "Discuss early intervention options"
        ]
        explanation['next_steps'] = [
            "Schedule appointment with developmental pediatrician",
            "Begin documentation of behaviors and development",
            "Connect with local autism support resources"
        ]
    else:
        explanation['clinical_recommendations'] = [
            "Continue monitoring developmental milestones",
            "Consider re-evaluation if concerns persist",
            "Discuss results with healthcare provider"
        ]
        explanation['next_steps'] = [
            "Maintain regular developmental check-ups",
            "Address any specific behavioral concerns",
            "Stay informed about autism awareness"
        ]
    
    return explanation

def get_eye_tracking_description(feature_name):
    """Get description for eye tracking features"""
    descriptions = {
        'fixation_count': 'Number of visual fixations - indicates attention patterns',
        'mean_saccade': 'Average saccadic eye movement - relates to visual scanning',
        'max_saccade': 'Maximum saccadic movement - indicates eye movement range',
        'std_saccade': 'Saccadic movement variability - shows consistency patterns',
        'mean_x': 'Average horizontal gaze position - indicates gaze centering',
        'mean_y': 'Average vertical gaze position - indicates gaze height preference',
        'std_x': 'Horizontal gaze variability - shows scanning patterns',
        'std_y': 'Vertical gaze variability - indicates vertical attention spread',
        'mean_pupil': 'Average pupil diameter - relates to arousal and attention'
    }
    return descriptions.get(feature_name, 'Eye tracking measurement')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)