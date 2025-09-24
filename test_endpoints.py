import requests
import json

print('🧪 Testing New API Endpoints')
print('=' * 40)

# Test eye tracking endpoint
print('\n1. Testing Eye Tracking Endpoint:')
try:
    response = requests.post('http://localhost:8000/api/assessment/eye_tracking', 
                           json={'test': 'data'}, timeout=5)
    if response.status_code == 200:
        result = response.json()
        print(f'   ✅ Eye Tracking: {response.status_code}')
        print(f'   📊 Prediction: {result.get("prediction")}')
        print(f'   🔧 Method: {result.get("model_results", {}).get("method")}')
    else:
        print(f'   ❌ Error: {response.status_code}')
except Exception as e:
    print(f'   ❌ Exception: {e}')

# Test facial analysis endpoint
print('\n2. Testing Facial Analysis Endpoint:')
try:
    response = requests.post('http://localhost:8000/api/assessment/facial_analysis', 
                           json={'test': 'data'}, timeout=5)
    if response.status_code == 200:
        result = response.json()
        print(f'   ✅ Facial Analysis: {response.status_code}')
        print(f'   📊 Prediction: {result.get("prediction")}')
        print(f'   🔧 Method: {result.get("model_results", {}).get("method")}')
    else:
        print(f'   ❌ Error: {response.status_code}')
except Exception as e:
    print(f'   ❌ Exception: {e}')

# Test complete assessment endpoint
print('\n3. Testing Complete Assessment Endpoint:')
try:
    response = requests.post('http://localhost:8000/api/assessment/complete', 
                           json={'session_id': 'test123'}, timeout=5)
    if response.status_code == 200:
        result = response.json()
        print(f'   ✅ Complete Assessment: {response.status_code}')
        print(f'   📊 Final Prediction: {result.get("final_prediction")}')
        print(f'   🎯 Final Confidence: {result.get("final_confidence")}')
    else:
        print(f'   ❌ Error: {response.status_code}')
except Exception as e:
    print(f'   ❌ Exception: {e}')

print('\n' + '=' * 40)
print('🎉 All endpoints tested!')
