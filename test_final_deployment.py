import requests
import time

print('Waiting for deployment...')
time.sleep(120)

# Test health endpoint
try:
    response = requests.get('https://web-production-22e4a.up.railway.app/health')
    result = response.json()
    print('Health check:', result)
    print('Server version:', result.get('server_version', 'N/A'))
    print('Models loaded:', result.get('models_loaded', 'N/A'))
except Exception as e:
    print('Health error:', e)

# Test behavioral assessment with different inputs
test_cases = [
    {
        'name': 'All zeros (should be NON-AUTISTIC)', 
        'data': {
            'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0,
            'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0,
            'age': 25, 'gender': 'm'
        }
    },
    {
        'name': 'All ones (should be AUTISTIC)', 
        'data': {
            'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0,
            'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0,
            'age': 25, 'gender': 'm'
        }
    },
    {
        'name': 'Mixed scores (should be NON-AUTISTIC)', 
        'data': {
            'A1_Score': 1.0, 'A2_Score': 0.0, 'A3_Score': 1.0, 'A4_Score': 0.0, 'A5_Score': 1.0,
            'A6_Score': 0.0, 'A7_Score': 1.0, 'A8_Score': 0.0, 'A9_Score': 1.0, 'A10_Score': 0.0,
            'age': 30, 'gender': 'f'
        }
    }
]

print('\nTesting Behavioral Assessment API...')
print('=' * 50)

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('https://web-production-22e4a.up.railway.app/api/assessment/behavioral', 
                               json=test_case['data'], timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f'  Prediction: {result.get("prediction", "N/A")}')
            print(f'  Method: {result.get("model_results", {}).get("method", "N/A")}')
            if 'total_score' in result.get('model_results', {}):
                print(f'  Total Score: {result.get("model_results", {}).get("total_score", "N/A")}')
            if 'explanation' in result:
                print(f'  Explanation: {result.get("explanation", {}).get("reasoning", "N/A")}')
        else:
            print(f'  Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  Error: {e}')

print('\n' + '=' * 50)
print('Test completed!')
