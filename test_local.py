import requests
import json

# Test cases with different expected outcomes
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

print('Testing Behavioral Assessment API locally...')
print('=' * 60)

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('http://localhost:8001/api/assessment/behavioral', 
                               json=test_case['data'], timeout=30)
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', 'N/A')
            confidence = result.get('confidence', 'N/A')
            method = result.get('model_results', {}).get('method', 'N/A')
            
            print(f'  ✅ Prediction: {prediction}')
            print(f'  📊 Confidence: {confidence:.3f}')
            print(f'  🔧 Method: {method}')
            
            # Check if it's using real ML models or fallback
            if method == 'fallback_rule_based':
                total_score = result.get('model_results', {}).get('total_score', 'N/A')
                print(f'  📈 Total Score: {total_score}')
                print(f'  💡 Using fallback rule-based assessment')
            else:
                print(f'  🤖 Using real ML models!')
                
        else:
            print(f'  ❌ Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  ❌ Error: {e}')

print('\n' + '=' * 60)
print('Local testing completed!')
