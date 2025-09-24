import requests
import json
import time

# Comprehensive test cases covering different scenarios
test_cases = [
    # Clear NON-AUTISTIC cases
    {
        'name': 'All zeros (Clear NON-AUTISTIC)',
        'data': {'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 25, 'gender': 'm'},
        'expected': 0
    },
    {
        'name': 'Very low scores (NON-AUTISTIC)',
        'data': {'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 30, 'gender': 'f'},
        'expected': 0
    },
    
    # Clear AUTISTIC cases
    {
        'name': 'All ones (Clear AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0, 'age': 25, 'gender': 'm'},
        'expected': 1
    },
    {
        'name': 'High scores (AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0, 'age': 35, 'gender': 'f'},
        'expected': 1
    },
    
    # Borderline cases
    {
        'name': 'Borderline low (NON-AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 0.0, 'A3_Score': 1.0, 'A4_Score': 0.0, 'A5_Score': 1.0, 'A6_Score': 0.0, 'A7_Score': 1.0, 'A8_Score': 0.0, 'A9_Score': 1.0, 'A10_Score': 0.0, 'age': 28, 'gender': 'm'},
        'expected': 0  # Score = 5, should be NON-AUTISTIC
    },
    {
        'name': 'Borderline high (AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 22, 'gender': 'f'},
        'expected': 1  # Score = 6, should be AUTISTIC
    },
    
    # Edge cases
    {
        'name': 'Exactly threshold (AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 40, 'gender': 'm'},
        'expected': 1  # Score = 6, exactly at threshold
    },
    {
        'name': 'Just below threshold (NON-AUTISTIC)',
        'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 18, 'gender': 'f'},
        'expected': 0  # Score = 5, just below threshold
    }
]

def test_server():
    """Test the server with comprehensive scenarios"""
    print("🧪 COMPREHENSIVE LOCAL TESTING")
    print("=" * 60)
    
    # Test health first
    print("\n1. Testing Health Endpoint:")
    try:
        response = requests.get('http://localhost:8001/health', timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"   ✅ Health: {health.get('status', 'unknown')}")
            print(f"   📊 Server Version: {health.get('server_version', 'unknown')}")
            print(f"   🤖 Models Loaded: {health.get('models_loaded', 'unknown')}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return False
    
    # Test behavioral assessments
    print(f"\n2. Testing Behavioral Assessments ({len(test_cases)} scenarios):")
    print("-" * 60)
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i:2d}. {test_case['name']}:")
        
        try:
            start_time = time.time()
            response = requests.post('http://localhost:8001/api/assessment/behavioral', 
                                   json=test_case['data'], timeout=10)
            end_time = time.time()
            
            if response.status_code == 200:
                result = response.json()
                prediction = result.get('prediction', 'N/A')
                probability = result.get('probability', 'N/A')
                confidence = result.get('confidence', 'N/A')
                method = result.get('model_results', {}).get('method', 'N/A')
                
                # Calculate expected score for rule-based
                total_score = sum([
                    test_case['data']['A1_Score'], test_case['data']['A2_Score'], 
                    test_case['data']['A3_Score'], test_case['data']['A4_Score'], 
                    test_case['data']['A5_Score'], test_case['data']['A6_Score'], 
                    test_case['data']['A7_Score'], test_case['data']['A8_Score'], 
                    test_case['data']['A9_Score'], test_case['data']['A10_Score']
                ])
                
                print(f"    📊 Prediction: {prediction}")
                print(f"    📈 Probability: {probability:.3f}")
                print(f"    🎯 Confidence: {confidence:.3f}")
                print(f"    🔧 Method: {method}")
                print(f"    📈 Total Score: {total_score}")
                print(f"    ⏱️  Response Time: {(end_time - start_time):.2f}s")
                
                # Check if prediction matches expected
                if prediction == test_case['expected']:
                    print(f"    ✅ CORRECT: Expected {test_case['expected']}, got {prediction}")
                    passed += 1
                else:
                    print(f"    ❌ WRONG: Expected {test_case['expected']}, got {prediction}")
                    failed += 1
                    
            else:
                print(f"    ❌ HTTP Error: {response.status_code} - {response.text}")
                failed += 1
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")
            failed += 1
    
    # Summary
    print(f"\n" + "=" * 60)
    print(f"📊 TEST SUMMARY:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print(f"\n🎉 ALL TESTS PASSED! The server is working correctly!")
        return True
    else:
        print(f"\n⚠️  Some tests failed. Check the results above.")
        return False

if __name__ == "__main__":
    test_server()
