"""
Simplified ASD Detection ML Training Pipeline
"""

import pandas as pd
import numpy as np
import warnings
import os
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')

def train_behavioral_models():
    """Train models on behavioral data"""
    print("="*60)
    print("TRAINING MODELS ON BEHAVIORAL DATA")
    print("="*60)
    
    # Load data
    data = pd.read_csv('/app/autism_behavioral.csv')
    print(f"Loaded behavioral data: {data.shape}")
    
    # Prepare features (A1_Score to A10_Score + age + gender)
    feature_cols = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
                   'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score', 
                   'age', 'gender']
    
    X = data[feature_cols].values
    
    # Prepare target
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(data['label'])
    
    print(f"Features shape: {X.shape}")
    print(f"Target distribution: {np.unique(y, return_counts=True)}")
    print(f"Classes: {label_encoder.classes_}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("\n--- Training Random Forest ---")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate Random Forest
    rf_pred = rf_model.predict(X_test_scaled)
    rf_prob = rf_model.predict_proba(X_test_scaled)[:, 1]
    rf_accuracy = accuracy_score(y_test, rf_pred)
    rf_auc = roc_auc_score(y_test, rf_prob)
    
    print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
    print(f"Random Forest AUC: {rf_auc:.4f}")
    print(f"Classification Report:\n{classification_report(y_test, rf_pred)}")
    
    # Feature importance
    importance = rf_model.feature_importances_
    feature_importance = dict(zip(feature_cols, importance))
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop 10 Most Important Features:")
    for i, (feature, imp) in enumerate(sorted_features[:10]):
        print(f"{i+1}. {feature}: {imp:.4f}")
    
    # Train SVM
    print("\n--- Training SVM ---")
    svm_model = SVC(C=10, gamma='scale', kernel='rbf', probability=True, random_state=42)
    svm_model.fit(X_train_scaled, y_train)
    
    # Evaluate SVM
    svm_pred = svm_model.predict(X_test_scaled)
    svm_prob = svm_model.predict_proba(X_test_scaled)[:, 1]
    svm_accuracy = accuracy_score(y_test, svm_pred)
    svm_auc = roc_auc_score(y_test, svm_prob)
    
    print(f"SVM Accuracy: {svm_accuracy:.4f}")
    print(f"SVM AUC: {svm_auc:.4f}")
    print(f"Classification Report:\n{classification_report(y_test, svm_pred)}")
    
    # Ensemble prediction
    print("\n--- Creating Ensemble ---")
    ensemble_prob = (rf_prob + svm_prob) / 2
    ensemble_pred = (ensemble_prob > 0.5).astype(int)
    ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
    ensemble_auc = roc_auc_score(y_test, ensemble_prob)
    
    print(f"Ensemble Accuracy: {ensemble_accuracy:.4f}")
    print(f"Ensemble AUC: {ensemble_auc:.4f}")
    print(f"Classification Report:\n{classification_report(y_test, ensemble_pred)}")
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(rf_model, 'models/behavioral_rf_model.joblib')
    joblib.dump(svm_model, 'models/behavioral_svm_model.joblib')
    joblib.dump(scaler, 'models/behavioral_scaler.joblib')
    joblib.dump(label_encoder, 'models/behavioral_label_encoder.joblib')
    
    print("\nModels saved successfully!")
    
    # Generate explanation
    print("\n--- Model Explanation ---")
    print("The Random Forest model uses the following decision process:")
    print("1. Each tree in the forest makes a prediction based on feature values")
    print("2. The final prediction is made by majority voting")
    print("3. Key indicators for ASD detection (based on feature importance):")
    
    for i, (feature, imp) in enumerate(sorted_features[:5]):
        print(f"   - {feature}: {imp:.3f} importance")
        if 'A' in feature and 'Score' in feature:
            print(f"     (Behavioral assessment question {feature.replace('_Score', '')})")
    
    return {
        'rf_accuracy': rf_accuracy,
        'svm_accuracy': svm_accuracy,
        'ensemble_accuracy': ensemble_accuracy,
        'feature_importance': sorted_features
    }

def train_eye_tracking_models():
    """Train models on eye tracking data"""
    print("\n" + "="*60)
    print("TRAINING MODELS ON EYE TRACKING DATA")
    print("="*60)
    
    # Load data
    data = pd.read_csv('/app/processed_features.csv')
    print(f"Loaded eye tracking data: {data.shape}")
    
    # Prepare features (exclude participant_id and label)
    feature_cols = ['fixation_count', 'mean_saccade', 'max_saccade', 'std_saccade', 
                   'mean_x', 'mean_y', 'std_x', 'std_y', 'mean_pupil']
    
    X = data[feature_cols].values
    y = data['label'].values
    
    print(f"Features shape: {X.shape}")
    print(f"Target distribution: {np.unique(y, return_counts=True)}")
    
    # Check if we have both classes
    if len(np.unique(y)) < 2:
        print("Warning: Only one class found in eye tracking data. Skipping training.")
        return None
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("\n--- Training Random Forest ---")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=2,
        random_state=42
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate Random Forest
    rf_pred = rf_model.predict(X_test_scaled)
    rf_prob = rf_model.predict_proba(X_test_scaled)[:, 1]
    rf_accuracy = accuracy_score(y_test, rf_pred)
    rf_auc = roc_auc_score(y_test, rf_prob)
    
    print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
    print(f"Random Forest AUC: {rf_auc:.4f}")
    print(f"Classification Report:\n{classification_report(y_test, rf_pred)}")
    
    # Feature importance
    importance = rf_model.feature_importances_
    feature_importance = dict(zip(feature_cols, importance))
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop Eye Tracking Features:")
    for i, (feature, imp) in enumerate(sorted_features):
        print(f"{i+1}. {feature}: {imp:.4f}")
    
    # Train SVM
    print("\n--- Training SVM ---")
    svm_model = SVC(C=1, gamma='scale', kernel='rbf', probability=True, random_state=42)
    svm_model.fit(X_train_scaled, y_train)
    
    # Evaluate SVM
    svm_pred = svm_model.predict(X_test_scaled)
    svm_prob = svm_model.predict_proba(X_test_scaled)[:, 1]
    svm_accuracy = accuracy_score(y_test, svm_pred)
    svm_auc = roc_auc_score(y_test, svm_prob)
    
    print(f"SVM Accuracy: {svm_accuracy:.4f}")
    print(f"SVM AUC: {svm_auc:.4f}")
    print(f"Classification Report:\n{classification_report(y_test, svm_pred)}")
    
    # Save models
    joblib.dump(rf_model, 'models/eye_tracking_rf_model.joblib')
    joblib.dump(svm_model, 'models/eye_tracking_svm_model.joblib')
    joblib.dump(scaler, 'models/eye_tracking_scaler.joblib')
    
    print("\nEye tracking models saved successfully!")
    
    # Generate explanation
    print("\n--- Eye Tracking Analysis ---")
    print("The model identifies ASD based on eye movement patterns:")
    print("Key eye tracking metrics (based on feature importance):")
    
    for i, (feature, imp) in enumerate(sorted_features[:5]):
        print(f"   - {feature}: {imp:.3f} importance")
        if 'fixation' in feature:
            print("     (Related to visual attention duration)")
        elif 'saccade' in feature:
            print("     (Related to rapid eye movements between fixations)")
        elif 'pupil' in feature:
            print("     (Related to pupil diameter variations)")
        elif 'mean_x' in feature or 'mean_y' in feature:
            print("     (Related to gaze position patterns)")
    
    return {
        'rf_accuracy': rf_accuracy,
        'svm_accuracy': svm_accuracy,
        'feature_importance': sorted_features
    }

def main():
    """Main training function"""
    print("Starting ASD Detection ML Training Pipeline")
    print("Current time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    # Train behavioral models
    behavioral_results = train_behavioral_models()
    
    # Train eye tracking models
    eye_tracking_results = train_eye_tracking_models()
    
    # Summary
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    
    print("BEHAVIORAL DATA RESULTS:")
    print(f"  Random Forest Accuracy: {behavioral_results['rf_accuracy']:.4f}")
    print(f"  SVM Accuracy: {behavioral_results['svm_accuracy']:.4f}")
    print(f"  Ensemble Accuracy: {behavioral_results['ensemble_accuracy']:.4f}")
    
    if eye_tracking_results:
        print("\nEYE TRACKING DATA RESULTS:")
        print(f"  Random Forest Accuracy: {eye_tracking_results['rf_accuracy']:.4f}")
        print(f"  SVM Accuracy: {eye_tracking_results['svm_accuracy']:.4f}")
    
    print("\nMODEL INTERPRETATION:")
    print("The ASD detection system uses multiple approaches:")
    print("1. Behavioral Assessment: Analyzes responses to ASD screening questions")
    print("2. Eye Tracking Analysis: Examines visual attention patterns")
    print("3. Ensemble Method: Combines predictions for improved accuracy")
    
    print("\nTRAINING COMPLETED SUCCESSFULLY!")
    print("Models saved in 'models/' directory")

if __name__ == "__main__":
    main()