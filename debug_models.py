import joblib
import numpy as np
import os

print("Testing ML models directly...")

try:
    # Load models
    print("Loading models...")
    rf_model = joblib.load('models/behavioral_rf_model.joblib')
    svm_model = joblib.load('models/behavioral_svm_model.joblib')
    scaler = joblib.load('models/behavioral_scaler.joblib')
    
    print("✅ Models loaded successfully!")
    
    # Test with simple data
    test_features = np.array([[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 25, 1]])
    
    print("Scaling features...")
    features_scaled = scaler.transform(test_features)
    print("✅ Features scaled successfully!")
    
    print("Making predictions...")
    rf_pred = rf_model.predict_proba(features_scaled)[0]
    svm_pred = svm_model.predict_proba(features_scaled)[0]
    
    print("✅ Predictions made successfully!")
    print(f"RF prediction: {rf_pred}")
    print(f"SVM prediction: {svm_pred}")
    
    # Simple ensemble
    ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
    ensemble_pred = 1 if ensemble_prob > 0.5 else 0
    
    print(f"Ensemble probability: {ensemble_prob}")
    print(f"Ensemble prediction: {ensemble_pred}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
