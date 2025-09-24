import requests
import json
import time

print('Waiting for deployment to complete...')
time.sleep(30)

# Test the behavioral assessment endpoint
test_data = {
    'A1_Score': 0.0,
    'A2_Score': 0.0,
    'A3_Score': 0.0,
    'A4_Score': 0.0,
    'A5_Score': 0.0,
    'A6_Score': 0.0,
    'A7_Score': 0.0,
    'A8_Score': 0.0,
    'A9_Score': 0.0,
    'A10_Score': 0.0,
    'age': 25,
    'gender': 'm'
}

print('Testing with all 0s (should be NON-AUTISTIC):')
try:
    response = requests.post('https://web-production-22e4a.up.railway.app/api/assessment/behavioral', 
                           json=test_data, timeout=30)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print(f'Prediction: {result.get("prediction", "N/A")}')
        print(f'Confidence: {result.get("confidence", "N/A")}')
        print(f'Status: {result.get("status", "N/A")}')
    else:
        print(f'Error response: {response.text}')
except Exception as e:
    print(f'Error: {e}')

print('\n' + '='*50 + '\n')

# Test with all 1s
test_data_positive = {
    'A1_Score': 1.0,
    'A2_Score': 1.0,
    'A3_Score': 1.0,
    'A4_Score': 1.0,
    'A5_Score': 1.0,
    'A6_Score': 1.0,
    'A7_Score': 1.0,
    'A8_Score': 1.0,
    'A9_Score': 1.0,
    'A10_Score': 1.0,
    'age': 25,
    'gender': 'm'
}

print('Testing with all 1s (should be AUTISTIC):')
try:
    response = requests.post('https://web-production-22e4a.up.railway.app/api/assessment/behavioral', 
                           json=test_data_positive, timeout=30)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print(f'Prediction: {result.get("prediction", "N/A")}')
        print(f'Confidence: {result.get("confidence", "N/A")}')
        print(f'Status: {result.get("status", "N/A")}')
    else:
        print(f'Error response: {response.text}')
except Exception as e:
    print(f'Error: {e}')
