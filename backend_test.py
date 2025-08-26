#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for ASD Detection System
Tests all endpoints: behavioral, eye_tracking, facial_analysis, and complete assessment
"""

import requests
import sys
import json
from datetime import datetime
import time

class ASDBackendTester:
    def __init__(self, base_url="https://autism-scan.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
    def test_health_endpoints(self):
        """Test basic health and root endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test API root endpoint
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                expected_keys = ['message', 'version', 'status', 'stages']
                success = all(key in data for key in expected_keys)
            self.log_test("API Root Endpoint", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            
        # Test API health endpoint
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                expected_keys = ['status', 'timestamp', 'models_loaded', 'available_stages']
                success = all(key in data for key in expected_keys)
                if success:
                    print(f"   Models loaded: {data.get('models_loaded', 0)}")
            self.log_test("API Health Endpoint", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("API Health Endpoint", False, str(e))
    
    def test_behavioral_assessment(self):
        """Test behavioral assessment endpoint with standard binary values"""
        print("\n🧠 Testing Behavioral Assessment (Binary Values)...")
        
        # Test data - simulating a user with some ASD indicators
        test_data = {
            "A1_Score": 1,  # Social situations challenging
            "A2_Score": 0,  # No communication difficulty
            "A3_Score": 1,  # Repetitive behaviors
            "A4_Score": 1,  # Prefer routine
            "A5_Score": 1,  # Focus intensely on interests
            "A6_Score": 1,  # Sensory sensitivity
            "A7_Score": 0,  # No delayed language
            "A8_Score": 0,  # No motor skill issues
            "A9_Score": 1,  # Hard to adapt to changes
            "A10_Score": 0,  # No emotion regulation issues
            "age": 28.0,
            "gender": "m"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/behavioral",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            success = response.status_code == 200
            if success:
                result = response.json()
                required_keys = ['prediction', 'probability', 'confidence', 'model_results', 'explanation', 'stage']
                success = all(key in result for key in required_keys)
                
                if success:
                    print(f"   Prediction: {result['prediction']} (ASD: {result['prediction'] == 1})")
                    print(f"   Probability: {result['probability']:.3f}")
                    print(f"   Confidence: {result['confidence']:.3f}")
                    print(f"   RF Prediction: {result['model_results']['random_forest']['prediction']}")
                    print(f"   SVM Prediction: {result['model_results']['svm']['prediction']}")
                    
                    # Check for PSO results
                    if 'pso' in result['model_results']:
                        pso_result = result['model_results']['pso']
                        print(f"   PSO Prediction: {pso_result['prediction']}")
                        print(f"   PSO Probability: {pso_result['probability']:.3f}")
                        print(f"   PSO Weights: {pso_result['weights']}")
                        success = success and 'weights' in pso_result
                    else:
                        print("   ❌ PSO results missing from model_results")
                        success = False
                    
                    # Store result for later use
                    self.behavioral_result = result
                    
            self.log_test("Behavioral Assessment (Binary)", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Behavioral Assessment (Binary)", False, str(e))

    def test_behavioral_assessment_with_neutral_values(self):
        """Test behavioral assessment endpoint with neutral values (0.5)"""
        print("\n🧠 Testing Behavioral Assessment (With Neutral Values)...")
        
        # Test data with neutral values mixed in - this is the key new feature to test
        test_data = {
            "A1_Score": 0.5,  # Neutral - sometimes challenging in social situations
            "A2_Score": 0,    # No communication difficulty
            "A3_Score": 1,    # Repetitive behaviors
            "A4_Score": 0.5,  # Neutral - sometimes prefer routine
            "A5_Score": 1,    # Focus intensely on interests
            "A6_Score": 0.5,  # Neutral - some sensory sensitivity
            "A7_Score": 0,    # No delayed language
            "A8_Score": 0.5,  # Neutral - some motor skill concerns
            "A9_Score": 1,    # Hard to adapt to changes
            "A10_Score": 0.5, # Neutral - some emotion regulation issues
            "age": 25.0,
            "gender": "f"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/behavioral",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            success = response.status_code == 200
            if success:
                result = response.json()
                required_keys = ['prediction', 'probability', 'confidence', 'model_results', 'explanation', 'stage']
                success = all(key in result for key in required_keys)
                
                if success:
                    print(f"   Prediction: {result['prediction']} (ASD: {result['prediction'] == 1})")
                    print(f"   Probability: {result['probability']:.3f}")
                    print(f"   Confidence: {result['confidence']:.3f}")
                    
                    # Verify PSO integration is working with neutral values
                    if 'pso' in result['model_results']:
                        pso_result = result['model_results']['pso']
                        print(f"   PSO Prediction: {pso_result['prediction']}")
                        print(f"   PSO Probability: {pso_result['probability']:.3f}")
                        print(f"   PSO Weights: {pso_result['weights']}")
                        
                        # Verify PSO weights are valid (should sum to ~1.0)
                        weights_sum = sum(pso_result['weights'])
                        print(f"   PSO Weights Sum: {weights_sum:.3f}")
                        success = success and abs(weights_sum - 1.0) < 0.1
                    else:
                        print("   ❌ PSO results missing from model_results")
                        success = False
                    
                    # Store result for comparison
                    self.behavioral_neutral_result = result
                    
            self.log_test("Behavioral Assessment (Neutral Values)", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Behavioral Assessment (Neutral Values)", False, str(e))
    
    def test_eye_tracking_assessment(self):
        """Test eye tracking assessment endpoint"""
        print("\n👁️ Testing Eye Tracking Assessment...")
        
        # Mock eye tracking data
        test_data = {
            "fixation_count": 75.5,
            "mean_saccade": 45.2,
            "max_saccade": 89.1,
            "std_saccade": 15.3,
            "mean_x": 512.0,
            "mean_y": 384.0,
            "std_x": 78.5,
            "std_y": 65.2,
            "mean_pupil": 4.2
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/eye_tracking",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            # Eye tracking models might not be available (501 is acceptable)
            success = response.status_code in [200, 501]
            
            if response.status_code == 200:
                result = response.json()
                required_keys = ['prediction', 'probability', 'confidence', 'model_results', 'explanation', 'stage']
                success = all(key in result for key in required_keys)
                
                if success:
                    print(f"   Prediction: {result['prediction']} (ASD: {result['prediction'] == 1})")
                    print(f"   Probability: {result['probability']:.3f}")
                    print(f"   Confidence: {result['confidence']:.3f}")
                    
                    # Store result for later use
                    self.eye_tracking_result = result
                    
            elif response.status_code == 501:
                print("   Eye tracking models not available (expected for demo)")
                self.eye_tracking_result = None
                
            self.log_test("Eye Tracking Assessment", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Eye Tracking Assessment", False, str(e))
    
    def test_facial_analysis_assessment(self):
        """Test facial analysis assessment endpoint"""
        print("\n📷 Testing Facial Analysis Assessment...")
        
        # Mock facial analysis data
        test_data = {
            "facial_features": [0.1, 0.2, 0.3, 0.4, 0.5] * 25 + [0.6, 0.7, 0.8],  # 128 features
            "emotion_scores": {
                "happy": 0.3,
                "sad": 0.1,
                "neutral": 0.5,
                "surprised": 0.05,
                "angry": 0.05
            },
            "attention_patterns": {
                "attention_to_faces": 0.4,
                "attention_to_objects": 0.6,
                "gaze_stability": 0.7
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/facial_analysis",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            success = response.status_code == 200
            if success:
                result = response.json()
                required_keys = ['prediction', 'probability', 'confidence', 'explanation', 'stage']
                success = all(key in result for key in required_keys)
                
                if success:
                    print(f"   Prediction: {result['prediction']} (ASD: {result['prediction'] == 1})")
                    print(f"   Probability: {result['probability']:.3f}")
                    print(f"   Confidence: {result['confidence']:.3f}")
                    
                    # Store result for later use
                    self.facial_analysis_result = result
                    
            self.log_test("Facial Analysis Assessment", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Facial Analysis Assessment", False, str(e))
    
    def test_complete_assessment(self):
        """Test complete assessment endpoint"""
        print("\n🎯 Testing Complete Assessment...")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/complete",
                json={"session_id": self.session_id},
                headers={'Content-Type': 'application/json'},
                timeout=20
            )
            
            success = response.status_code == 200
            if success:
                result = response.json()
                required_keys = ['final_prediction', 'final_probability', 'confidence_score', 'explanation', 'stages_completed']
                success = all(key in result for key in required_keys)
                
                if success:
                    print(f"   Final Prediction: {result['final_prediction']} (ASD: {result['final_prediction'] == 1})")
                    print(f"   Final Probability: {result['final_probability']:.3f}")
                    print(f"   Confidence Score: {result['confidence_score']:.3f}")
                    print(f"   Stages Completed: {result['stages_completed']}")
                    
                    if 'stage_results' in result:
                        print(f"   Available Stage Results: {list(result['stage_results'].keys())}")
                    
                    # Check explanation structure
                    if 'explanation' in result and result['explanation']:
                        exp = result['explanation']
                        if 'overall_result' in exp:
                            print(f"   Overall Result: {exp['overall_result']}")
                    
            self.log_test("Complete Assessment", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Complete Assessment", False, str(e))
    
    def test_error_handling(self):
        """Test API error handling with invalid data"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test behavioral with invalid data
        invalid_data = {
            "A1_Score": 2,  # Invalid score (should be 0 or 1)
            "age": -5,      # Invalid age
            "gender": "x"   # Invalid gender
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/assessment/behavioral",
                json=invalid_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # Should return 422 (validation error) or 400 (bad request)
            success = response.status_code in [400, 422]
            self.log_test("Error Handling - Invalid Data", success, f"Status: {response.status_code}")
            
        except Exception as e:
            self.log_test("Error Handling - Invalid Data", False, str(e))
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting ASD Detection System Backend Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_behavioral_assessment()
        self.test_eye_tracking_assessment()
        self.test_facial_analysis_assessment()
        self.test_complete_assessment()
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend is working correctly.")
            return 0
        else:
            print("❌ Some tests failed. Check the details above.")
            return 1

def main():
    """Main test execution"""
    tester = ASDBackendTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())