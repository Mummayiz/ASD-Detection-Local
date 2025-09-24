import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# Load the dataset
df = pd.read_csv('autism_behavioral.csv')

print('Dataset Analysis:')
print('=' * 50)
print(f'Total samples: {len(df)}')
print(f'Features: {df.shape[1]}')

# Check class distribution
print('\nClass Distribution:')
print(df['Class/ASD'].value_counts())
no_count = df['Class/ASD'].value_counts()['NO']
yes_count = df['Class/ASD'].value_counts()['YES']
print(f'Class ratio (NO/YES): {no_count / yes_count:.2f}')

# Check for missing values
print('\nMissing Values:')
print(df.isnull().sum().sum())

# Check feature ranges
print('\nFeature Ranges:')
score_cols = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score']
for col in score_cols:
    print(f'{col}: {df[col].min()} - {df[col].max()}')

print(f'age: {df["age"].min()} - {df["age"].max()}')
print(f'gender: {df["gender"].unique()}')

# Check if models exist
print('\nModel Files:')
import os
model_files = ['behavioral_rf_model.joblib', 'behavioral_svm_model.joblib', 'behavioral_scaler.joblib', 'behavioral_label_encoder.joblib']
for file in model_files:
    path = f'models/{file}'
    exists = os.path.exists(path)
    print(f'{file}: {"EXISTS" if exists else "MISSING"}')
    if exists:
        try:
            model = joblib.load(path)
            print(f'  - Type: {type(model)}')
            if hasattr(model, 'classes_'):
                print(f'  - Classes: {model.classes_}')
        except Exception as e:
            print(f'  - Error loading: {e}')
