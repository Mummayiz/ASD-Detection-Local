"""
ASD Detection ML Training Pipeline
Trains Random Forest, SVM, PSO, and CNN models on the provided datasets
"""

import pandas as pd
import numpy as np
import warnings
import os
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score
import pyswarms as ps
import matplotlib.pyplot as plt
import shap

warnings.filterwarnings('ignore')

class ASDDataProcessor:
    """Data preprocessing for ASD detection datasets"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def load_behavioral_data(self, filepath):
        """Load and preprocess behavioral dataset"""
        try:
            data = pd.read_csv(filepath)
            print(f"Loaded behavioral dataset: {data.shape}")
            print(f"Columns: {data.columns.tolist()}")
            return data
        except Exception as e:
            print(f"Error loading behavioral data: {e}")
            return None
    
    def load_eye_tracking_data(self, filepath):
        """Load and preprocess eye tracking dataset"""
        try:
            data = pd.read_csv(filepath)
            print(f"Loaded eye tracking dataset: {data.shape}")
            print(f"Columns: {data.columns.tolist()}")
            return data
        except Exception as e:
            print(f"Error loading eye tracking data: {e}")
            return None
    
    def preprocess_behavioral_data(self, data):
        """Preprocess behavioral dataset"""
        # Handle missing values
        data = data.fillna(data.mean())
        
        # Identify features and target
        # Based on your CSV structure, looking for label column
        if 'label' in data.columns:
            target_col = 'label'
        elif 'Class/ASD' in data.columns:
            target_col = 'Class/ASD'
        else:
            # Find potential target columns
            potential_targets = ['autistic', 'non_autistic', 'ASD', 'result']
            target_col = None
            for col in potential_targets:
                if col in data.columns:
                    target_col = col
                    break
        
        if target_col is None:
            print("Warning: No clear target column found. Using last column as target.")
            target_col = data.columns[-1]
        
        # Prepare features
        feature_columns = []
        for col in data.columns:
            if col != target_col and data[col].dtype in ['int64', 'float64']:
                feature_columns.append(col)
        
        X = data[feature_columns].values
        
        # Handle target variable
        if data[target_col].dtype == 'object':
            # Convert string labels to binary
            y = self.label_encoder.fit_transform(data[target_col])
        else:
            y = data[target_col].values
        
        print(f"Features shape: {X.shape}")
        print(f"Target distribution: {np.unique(y, return_counts=True)}")
        
        return X, y, feature_columns
    
    def preprocess_eye_tracking_data(self, data):
        """Preprocess eye tracking dataset"""
        # Handle missing values
        data = data.fillna(data.mean())
        
        # Identify target column
        if 'label' in data.columns:
            target_col = 'label'
        else:
            target_col = data.columns[-1]
        
        # Prepare features (exclude non-numeric columns)
        feature_columns = []
        for col in data.columns:
            if col != target_col and col != 'participant_id' and data[col].dtype in ['int64', 'float64']:
                feature_columns.append(col)
        
        X = data[feature_columns].values
        y = data[target_col].values
        
        print(f"Eye tracking features shape: {X.shape}")
        print(f"Target distribution: {np.unique(y, return_counts=True)}")
        
        return X, y, feature_columns

class ASDModelTrainer:
    """ML Model training for ASD detection"""
    
    def __init__(self):
        self.models = {}
        self.results = {}
        self.feature_names = []
        
    def train_random_forest(self, X_train, y_train, X_test, y_test, optimize=True):
        """Train Random Forest model"""
        print("\n=== Training Random Forest ===")
        
        if optimize:
            # Grid search for hyperparameter optimization
            param_grid = {
                'n_estimators': [100, 200, 300],
                'max_depth': [10, 15, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            
            rf = RandomForestClassifier(random_state=42)
            grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
            grid_search.fit(X_train, y_train)
            
            best_rf = grid_search.best_estimator_
            print(f"Best RF parameters: {grid_search.best_params_}")
        else:
            best_rf = RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            best_rf.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = best_rf.predict(X_test)
        y_prob = best_rf.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        
        print(f"Random Forest Accuracy: {accuracy:.4f}")
        print(f"Random Forest AUC: {auc:.4f}")
        print(f"Classification Report:\n{classification_report(y_test, y_pred)}")
        
        # Store results
        self.models['random_forest'] = best_rf
        self.results['random_forest'] = {
            'accuracy': accuracy,
            'auc': auc,
            'feature_importance': best_rf.feature_importances_,
            'predictions': y_pred,
            'probabilities': y_prob
        }
        
        return best_rf
    
    def train_svm(self, X_train, y_train, X_test, y_test, optimize=True):
        """Train SVM model"""
        print("\n=== Training SVM ===")
        
        if optimize:
            param_grid = {
                'C': [0.1, 1, 10, 100],
                'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
                'kernel': ['rbf', 'linear']
            }
            
            svm = SVC(probability=True, random_state=42)
            grid_search = GridSearchCV(svm, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
            grid_search.fit(X_train, y_train)
            
            best_svm = grid_search.best_estimator_
            print(f"Best SVM parameters: {grid_search.best_params_}")
        else:
            best_svm = SVC(
                C=10,
                gamma='scale',
                kernel='rbf',
                probability=True,
                random_state=42
            )
            best_svm.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = best_svm.predict(X_test)
        y_prob = best_svm.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        
        print(f"SVM Accuracy: {accuracy:.4f}")
        print(f"SVM AUC: {auc:.4f}")
        print(f"Classification Report:\n{classification_report(y_test, y_pred)}")
        
        # Store results
        self.models['svm'] = best_svm
        self.results['svm'] = {
            'accuracy': accuracy,
            'auc': auc,
            'predictions': y_pred,
            'probabilities': y_prob
        }
        
        return best_svm
    
    def optimize_with_pso(self, X_train, y_train, model_type='random_forest'):
        """Optimize model hyperparameters using Particle Swarm Optimization"""
        print(f"\n=== PSO Optimization for {model_type} ===")
        
        def fitness_function(params):
            """Fitness function for PSO optimization"""
            scores = []
            for param_set in params:
                try:
                    if model_type == 'random_forest':
                        n_estimators = max(10, min(500, int(param_set[0])))
                        max_depth = max(5, min(30, int(param_set[1])))
                        min_samples_split = max(2, min(20, int(param_set[2])))
                        
                        model = RandomForestClassifier(
                            n_estimators=n_estimators,
                            max_depth=max_depth,
                            min_samples_split=min_samples_split,
                            random_state=42,
                            n_jobs=-1
                        )
                    elif model_type == 'svm':
                        C = 10 ** param_set[0]  # Log scale
                        gamma = 10 ** param_set[1]  # Log scale
                        
                        model = SVC(
                            C=C,
                            gamma=gamma,
                            kernel='rbf',
                            random_state=42
                        )
                    
                    # Cross-validation score
                    cv_scores = cross_val_score(model, X_train, y_train, cv=3, scoring='accuracy')
                    score = np.mean(cv_scores)
                    scores.append(-score)  # Negative because PSO minimizes
                    
                except Exception as e:
                    scores.append(-0.5)  # Poor score for invalid parameters
                    
            return np.array(scores)
        
        # Define bounds based on model type
        if model_type == 'random_forest':
            bounds = ([10, 5, 2], [500, 30, 20])  # [n_estimators, max_depth, min_samples_split]
            dimensions = 3
        elif model_type == 'svm':
            bounds = ([-3, -5], [3, 2])  # [log(C), log(gamma)]
            dimensions = 2
        
        # PSO optimization
        options = {'c1': 0.5, 'c2': 0.3, 'w': 0.9}
        optimizer = ps.single.GlobalBestPSO(
            n_particles=20,
            dimensions=dimensions,
            options=options,
            bounds=bounds
        )
        
        best_cost, best_pos = optimizer.optimize(fitness_function, iters=30)
        
        print(f"Best PSO cost (negative accuracy): {best_cost:.4f}")
        print(f"Best PSO accuracy: {-best_cost:.4f}")
        print(f"Best PSO parameters: {best_pos}")
        
        return best_pos, -best_cost
    
    def create_ensemble(self, X_test, y_test):
        """Create ensemble predictions from all models"""
        print("\n=== Creating Ensemble Model ===")
        
        if len(self.models) < 2:
            print("Need at least 2 models for ensemble")
            return None
        
        # Get predictions from all models
        ensemble_probs = []
        for name, model in self.models.items():
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(X_test)[:, 1]
            else:
                probs = model.predict(X_test)
            ensemble_probs.append(probs)
        
        # Average predictions
        ensemble_prob = np.mean(ensemble_probs, axis=0)
        ensemble_pred = (ensemble_prob > 0.5).astype(int)
        
        # Evaluate ensemble
        accuracy = accuracy_score(y_test, ensemble_pred)
        auc = roc_auc_score(y_test, ensemble_prob)
        
        print(f"Ensemble Accuracy: {accuracy:.4f}")
        print(f"Ensemble AUC: {auc:.4f}")
        print(f"Classification Report:\n{classification_report(y_test, ensemble_pred)}")
        
        self.results['ensemble'] = {
            'accuracy': accuracy,
            'auc': auc,
            'predictions': ensemble_pred,
            'probabilities': ensemble_prob
        }
        
        return ensemble_pred, ensemble_prob
    
    def explain_model_predictions(self, X_train, X_test, model_name='random_forest'):
        """Generate SHAP explanations for model predictions"""
        print(f"\n=== Generating Explanations for {model_name} ===")
        
        if model_name not in self.models:
            print(f"Model {model_name} not found")
            return None
        
        model = self.models[model_name]
        
        try:
            if model_name == 'random_forest':
                # Use TreeExplainer for Random Forest
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X_test[:50])  # Limit samples for speed
                
                # Feature importance from SHAP
                if isinstance(shap_values, list):
                    importance = np.abs(shap_values[1]).mean(axis=0)
                else:
                    importance = np.abs(shap_values).mean(axis=0)
                
                # Create feature importance report
                feature_importance = {}
                for i, imp in enumerate(importance):
                    feature_name = self.feature_names[i] if i < len(self.feature_names) else f'feature_{i}'
                    feature_importance[feature_name] = imp
                
                # Sort by importance
                sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
                
                print("Top 10 Most Important Features:")
                for i, (feature, imp) in enumerate(sorted_features[:10]):
                    print(f"{i+1}. {feature}: {imp:.4f}")
                
                return sorted_features
                
        except Exception as e:
            print(f"Error generating explanations: {e}")
            
            # Fallback to feature importance for Random Forest
            if model_name == 'random_forest' and hasattr(model, 'feature_importances_'):
                feature_importance = {}
                for i, imp in enumerate(model.feature_importances_):
                    feature_name = self.feature_names[i] if i < len(self.feature_names) else f'feature_{i}'
                    feature_importance[feature_name] = imp
                
                sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
                
                print("Top 10 Most Important Features (from model):")
                for i, (feature, imp) in enumerate(sorted_features[:10]):
                    print(f"{i+1}. {feature}: {imp:.4f}")
                
                return sorted_features
        
        return None
    
    def save_models(self, save_dir='models'):
        """Save trained models"""
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        
        for name, model in self.models.items():
            filepath = os.path.join(save_dir, f'asd_{name}_model.joblib')
            joblib.dump(model, filepath)
            print(f"Saved {name} model to {filepath}")
    
    def print_model_comparison(self):
        """Print comparison of all models"""
        print("\n" + "="*60)
        print("MODEL PERFORMANCE COMPARISON")
        print("="*60)
        
        for name, result in self.results.items():
            print(f"{name.upper()}:")
            print(f"  Accuracy: {result['accuracy']:.4f}")
            print(f"  AUC:      {result['auc']:.4f}")
            print()

def main():
    """Main training pipeline"""
    print("Starting ASD Detection ML Training Pipeline")
    print("="*50)
    
    # Initialize components
    processor = ASDDataProcessor()
    trainer = ASDModelTrainer()
    
    # Load datasets
    behavioral_data = processor.load_behavioral_data('/app/autism_behavioral.csv')
    eye_tracking_data = processor.load_eye_tracking_data('/app/processed_features.csv')
    
    if behavioral_data is None and eye_tracking_data is None:
        print("Error: No datasets loaded successfully")
        return
    
    # Process behavioral data if available
    if behavioral_data is not None:
        print("\n=== Processing Behavioral Data ===")
        X_behavioral, y_behavioral, behavioral_features = processor.preprocess_behavioral_data(behavioral_data)
        trainer.feature_names = behavioral_features
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_behavioral, y_behavioral, test_size=0.2, random_state=42, stratify=y_behavioral
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        
        print(f"Training set: {X_train.shape}")
        print(f"Test set: {X_test.shape}")
        
        # Train models
        trainer.train_random_forest(X_train, y_train, X_test, y_test, optimize=False)
        trainer.train_svm(X_train, y_train, X_test, y_test, optimize=False)
        
        # PSO Optimization (quick version)
        try:
            best_rf_params, best_rf_score = trainer.optimize_with_pso(X_train, y_train, 'random_forest')
        except Exception as e:
            print(f"PSO optimization failed: {e}")
        
        # Create ensemble
        trainer.create_ensemble(X_test, y_test)
        
        # Generate explanations
        trainer.explain_model_predictions(X_train, X_test, 'random_forest')
        
        # Save models
        trainer.save_models()
        
        # Print results
        trainer.print_model_comparison()
    
    # Process eye tracking data if available
    if eye_tracking_data is not None:
        print("\n=== Processing Eye Tracking Data ===")
        X_eye, y_eye, eye_features = processor.preprocess_eye_tracking_data(eye_tracking_data)
        
        if len(np.unique(y_eye)) > 1:  # Check if we have both classes
            # Split data
            X_train_eye, X_test_eye, y_train_eye, y_test_eye = train_test_split(
                X_eye, y_eye, test_size=0.2, random_state=42, stratify=y_eye
            )
            
            # Scale features
            scaler_eye = StandardScaler()
            X_train_eye = scaler_eye.fit_transform(X_train_eye)
            X_test_eye = scaler_eye.transform(X_test_eye)
            
            print(f"Eye tracking training set: {X_train_eye.shape}")
            print(f"Eye tracking test set: {X_test_eye.shape}")
            
            # Create separate trainer for eye tracking
            eye_trainer = ASDModelTrainer()
            eye_trainer.feature_names = eye_features
            
            # Train models on eye tracking data
            eye_trainer.train_random_forest(X_train_eye, y_train_eye, X_test_eye, y_test_eye, optimize=False)
            eye_trainer.train_svm(X_train_eye, y_train_eye, X_test_eye, y_test_eye, optimize=False)
            
            # Create ensemble
            eye_trainer.create_ensemble(X_test_eye, y_test_eye)
            
            # Generate explanations
            eye_trainer.explain_model_predictions(X_train_eye, X_test_eye, 'random_forest')
            
            # Save eye tracking models
            eye_trainer.save_models('models/eye_tracking')
            
            # Print results
            print("\nEYE TRACKING MODEL RESULTS:")
            eye_trainer.print_model_comparison()
        else:
            print("Eye tracking data has only one class, skipping model training")
    
    print("\n" + "="*50)
    print("ASD Detection ML Training Pipeline Completed!")
    print("="*50)

if __name__ == "__main__":
    main()