import requests
import json

# Test different scenarios
test_cases = [
    {'name': 'All zeros (NON-AUTISTIC)', 'data': {'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0, 'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0, 'age': 25, 'gender': 'm'}},
    {'name': 'All ones (AUTISTIC)', 'data': {'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0, 'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0, 'age': 25, 'gender': 'm'}},
    {'name': 'Mixed scores (NON-AUTISTIC)', 'data': {'A1_Score': 1.0, 'A2_Score': 0.0, 'A3_Score': 1.0, 'A4_Score': 0.0, 'A5_Score': 1.0, 'A6_Score': 0.0, 'A7_Score': 1.0, 'A8_Score': 0.0, 'A9_Score': 1.0, 'A10_Score': 0.0, 'age': 30, 'gender': 'f'}}
]

print('Testing Simple Server with Different Inputs:')
print('=' * 60)

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('http://localhost:8001/api/assessment/behavioral', 
                               json=test_case['data'], timeout=5)
        if response.status_code == 200:
            result = response.json()
            prediction = result.get('prediction', 'N/A')
            confidence = result.get('confidence', 'N/A')
            total_score = result.get('model_results', {}).get('total_score', 'N/A')
            
            print(f'  ✅ Prediction: {prediction}')
            print(f'  📊 Confidence: {confidence:.3f}')
            print(f'  📈 Total Score: {total_score}')
            
            # Check if prediction makes sense
            if total_score >= 6 and prediction == 1:
                print(f'  ✅ Correct: High score ({total_score}) → ASD Positive')
            elif total_score < 6 and prediction == 0:
                print(f'  ✅ Correct: Low score ({total_score}) → ASD Negative')
            else:
                print(f'  ⚠️  Unexpected: Score {total_score} → Prediction {prediction}')
        else:
            print(f'  ❌ Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  ❌ Exception: {e}')

print('\n' + '=' * 60)
print('Simple server testing completed!')
