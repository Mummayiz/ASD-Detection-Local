import pandas as pd
import numpy as np

# Load and inspect the datasets
print("Loading datasets...")

# Load behavioral data
behavioral_data = pd.read_csv('/app/autism_behavioral.csv')
print(f"Behavioral data shape: {behavioral_data.shape}")
print(f"Behavioral columns: {behavioral_data.columns.tolist()}")
print(f"First few rows:")
print(behavioral_data.head())
print()

# Load eye tracking data  
eye_data = pd.read_csv('/app/processed_features.csv')
print(f"Eye tracking data shape: {eye_data.shape}")
print(f"Eye tracking columns: {eye_data.columns.tolist()}")
print(f"First few rows:")
print(eye_data.head())