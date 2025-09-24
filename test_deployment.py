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

print("Testing Behavioral Assessment API...")
print("=" * 50)

for test_case in test_cases:
    print(f'\n{test_case["name"]}:')
    try:
        response = requests.post('https://web-production-22e4a.up.railway.app/api/assessment/behavioral', 
                               json=test_case['data'], timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f'  Prediction: {result.get("prediction", "N/A")}')
            print(f'  Confidence: {result.get("confidence", "N/A")}')
            print(f'  Status: {result.get("status", "N/A")}')
            
            # Check if it's still using mock response
            if result.get('prediction') == 'Assessment completed':
                print('  ❌ Still using MOCK response')
            else:
                print('  ✅ Using REAL ML model')
                
            # Check for probability or prediction values
            if 'probability' in result:
                print(f'  Probability: {result.get("probability", "N/A")}')
            
        else:
            print(f'  Error: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'  Error: {e}')

print("\n" + "=" * 50)
print("Test completed!")
