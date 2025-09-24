import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Load the models
print("Loading models...")
rf_model = joblib.load('models/behavioral_rf_model.joblib')
svm_model = joblib.load('models/behavioral_svm_model.joblib')
scaler = joblib.load('models/behavioral_scaler.joblib')
label_encoder = joblib.load('models/behavioral_label_encoder.joblib')

print("Models loaded successfully!")
print(f"RF classes: {rf_model.classes_}")
print(f"SVM classes: {svm_model.classes_}")
print(f"Label encoder classes: {label_encoder.classes_}")

# Test with different inputs
test_cases = [
    # Case 1: All 0s (should be non-autistic)
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0],  # male
    # Case 2: All 1s (should be autistic)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 1],  # male
    # Case 3: Mixed scores (should be non-autistic)
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 30, 0],  # female
    # Case 4: High scores (should be autistic)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 1],  # male
]

for i, test_case in enumerate(test_cases):
    print(f"\nTest Case {i+1}: {test_case}")
    
    # Prepare features
    features = np.array([test_case])
    
    # Scale features
    features_scaled = scaler.transform(features)
    
    # Make predictions
    rf_pred = rf_model.predict_proba(features_scaled)[0]
    svm_pred = svm_model.predict_proba(features_scaled)[0]
    
    print(f"RF prediction: {rf_pred} (class: {rf_model.classes_[np.argmax(rf_pred)]})")
    print(f"SVM prediction: {svm_pred} (class: {svm_model.classes_[np.argmax(svm_pred)]})")
    
    # Check threshold
    rf_prob_positive = rf_pred[1] if len(rf_pred) > 1 else rf_pred[0]
    svm_prob_positive = svm_pred[1] if len(svm_pred) > 1 else svm_pred[0]
    
    print(f"RF prob of positive: {rf_prob_positive:.4f}")
    print(f"SVM prob of positive: {svm_prob_positive:.4f}")
    
    # Ensemble prediction
    ensemble_prob = (rf_prob_positive + svm_prob_positive) / 2
    ensemble_pred = 1 if ensemble_prob > 0.5 else 0
    
    print(f"Ensemble prob: {ensemble_prob:.4f}")
    print(f"Ensemble prediction: {ensemble_pred} ({'AUTISTIC' if ensemble_pred == 1 else 'NON-AUTISTIC'})")

# Check the scaler statistics
print(f"\nScaler mean: {scaler.mean_}")
print(f"Scaler scale: {scaler.scale_}")
