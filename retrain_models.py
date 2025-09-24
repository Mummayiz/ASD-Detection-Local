import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
from imblearn.over_sampling import SMOTE
import joblib
import os

print("Retraining models with current scikit-learn version...")

# Load the dataset
df = pd.read_csv('autism_behavioral.csv')

# Prepare features and target
feature_cols = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
                'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score', 'age', 'gender']

# Encode gender
df['gender_encoded'] = (df['gender'] == 'm').astype(int)

# Prepare features
X = df[['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 
        'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score', 
        'age', 'gender_encoded']].values

# Prepare target (1 for autistic, 0 for non-autistic)
y = (df['Class/ASD'] == 'YES').astype(int)

print(f"Dataset shape: {X.shape}")
print(f"Class distribution: {np.bincount(y)}")
print(f"Class ratio: {np.bincount(y)[0] / np.bincount(y)[1]:.2f}")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")

# Apply SMOTE for data balancing
print("Applying SMOTE for data balancing...")
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"After SMOTE - Class distribution: {np.bincount(y_train_balanced)}")
print(f"After SMOTE - Class ratio: {np.bincount(y_train_balanced)[0] / np.bincount(y_train_balanced)[1]:.2f}")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_balanced)
X_test_scaled = scaler.transform(X_test)

# Compute class weights for additional balancing
class_weights = compute_class_weight('balanced', classes=np.unique(y_train_balanced), y=y_train_balanced)
class_weight_dict = {0: class_weights[0], 1: class_weights[1]}
print(f"Class weights: {class_weight_dict}")

# Train Random Forest
print("Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight=class_weight_dict,
    random_state=42
)
rf_model.fit(X_train_scaled, y_train_balanced)

# Train SVM
print("Training SVM...")
svm_model = SVC(
    kernel='rbf',
    C=1.0,
    gamma='scale',
    probability=True,
    class_weight=class_weight_dict,
    random_state=42
)
svm_model.fit(X_train_scaled, y_train_balanced)

# Create label encoder for consistency
label_encoder = LabelEncoder()
label_encoder.fit(['non_autistic', 'autistic'])

# Evaluate models
print("\nEvaluating models...")

# Random Forest evaluation
rf_pred = rf_model.predict(X_test_scaled)
rf_pred_proba = rf_model.predict_proba(X_test_scaled)

print("Random Forest Results:")
print(classification_report(y_test, rf_pred, target_names=['Non-Autistic', 'Autistic']))
print("Confusion Matrix:")
print(confusion_matrix(y_test, rf_pred))

# SVM evaluation
svm_pred = svm_model.predict(X_test_scaled)
svm_pred_proba = svm_model.predict_proba(X_test_scaled)

print("\nSVM Results:")
print(classification_report(y_test, svm_pred, target_names=['Non-Autistic', 'Autistic']))
print("Confusion Matrix:")
print(confusion_matrix(y_test, svm_pred))

# Test with different inputs
print("\nTesting with different inputs:")

test_cases = [
    # Case 1: All 0s (should be non-autistic)
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0],
    # Case 2: All 1s (should be autistic)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25, 1],
    # Case 3: Mixed scores (should be non-autistic)
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 30, 0],
    # Case 4: High scores (should be autistic)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 20, 1],
]

for i, test_case in enumerate(test_cases):
    print(f"\nTest Case {i+1}: {test_case}")
    
    # Prepare features
    features = np.array([test_case])
    features_scaled = scaler.transform(features)
    
    # Make predictions
    rf_pred = rf_model.predict_proba(features_scaled)[0]
    svm_pred = svm_model.predict_proba(features_scaled)[0]
    
    print(f"RF prediction: {rf_pred} (class: {rf_model.classes_[np.argmax(rf_pred)]})")
    print(f"SVM prediction: {svm_pred} (class: {svm_model.classes_[np.argmax(svm_pred)]})")
    
    # Ensemble prediction
    ensemble_prob = (rf_pred[1] + svm_pred[1]) / 2
    ensemble_pred = 1 if ensemble_prob > 0.5 else 0
    
    print(f"Ensemble prob: {ensemble_prob:.4f}")
    print(f"Ensemble prediction: {ensemble_pred} ({'AUTISTIC' if ensemble_pred == 1 else 'NON-AUTISTIC'})")

# Save models
print("\nSaving models...")
os.makedirs('models', exist_ok=True)

joblib.dump(rf_model, 'models/behavioral_rf_model.joblib')
joblib.dump(svm_model, 'models/behavioral_svm_model.joblib')
joblib.dump(scaler, 'models/behavioral_scaler.joblib')
joblib.dump(label_encoder, 'models/behavioral_label_encoder.joblib')

print("Models saved successfully!")
print("Model files:")
for file in ['behavioral_rf_model.joblib', 'behavioral_svm_model.joblib', 'behavioral_scaler.joblib', 'behavioral_label_encoder.joblib']:
    print(f"  - models/{file}")
