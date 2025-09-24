import requests
import time

print('Waiting for deployment...')
time.sleep(60)

# Test with different inputs
test_cases = [
    {'name': 'All 0s (Non-Autistic)', 'data': {k: 0.0 for k in ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score']} | {'age': 25, 'gender': 'm'}},
    {'name': 'All 1s (Autistic)', 'data': {k: 1.0 for k in ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score']} | {'age': 25, 'gender': 'm'}},
    {'name': 'Mixed (Non-Autistic)', 'data': {'A1_Score': 1.0, 'A2_Score': 0.0, 'A3_Score': 1.0, 'A4_Score': 0.0, 'A5_Score': 1.0, 'A6_Score': 0.0, 'A7_Score': 1.0, 'A8_Score': 0.0, 'A9_Score': 1.0, 'A10_Score': 0.0, 'age': 30, 'gender': 'f'}},
]

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('https://web-production-22e4a.up.railway.app/api/assessment/behavioral', 
                               json=test_case['data'], timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f'  Status: {result.get("status", "N/A")}')
            print(f'  Prediction: {result.get("prediction", "N/A")}')
            print(f'  Confidence: {result.get("confidence", "N/A")}')
        else:
            print(f'  Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  Error: {e}')
