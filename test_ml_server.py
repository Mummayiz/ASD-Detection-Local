import requests
import json

# Test with different inputs to see ML model predictions
test_cases = [
    {'name': 'All zeros', 'data': {'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 25, 'gender': 'm'}},
    {'name': 'All ones', 'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0, 'age': 25, 'gender': 'm'}},
    {'name': 'High scores', 'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 30, 'gender': 'f'}}
]

print('Testing Fixed Server with ML Models:')
print('=' * 50)

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('http://localhost:8001/api/assessment/behavioral', 
                               json=test_case['data'], timeout=10)
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', 'N/A')
            probability = result.get('probability', 'N/A')
            method = result.get('model_results', {}).get('method', 'N/A')
            
            print(f'  ✅ Prediction: {prediction}')
            print(f'  📊 Probability: {probability:.3f}')
            print(f'  🔧 Method: {method}')
            
            if 'ensemble' in method or 'ML' in str(result.get('explanation', {}).get('method', '')):
                print(f'  🤖 Using ML models!')
            else:
                print(f'  💡 Using fallback method')
        else:
            print(f'  ❌ Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  ❌ Exception: {e}')

print('\n' + '=' * 50)
print('ML server testing completed!')
