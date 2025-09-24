import requests
import json

# Test with minimal data to see if it's a validation issue
print("Testing with minimal data...")

# Test 1: Very simple data
test_data = {
    'A1_Score': 0.0, 'A2_Score': 0.0, 'A3_Score': 0.0, 'A4_Score': 0.0, 'A5_Score': 0.0,
    'A6_Score': 0.0, 'A7_Score': 0.0, 'A8_Score': 0.0, 'A9_Score': 0.0, 'A10_Score': 0.0,
    'age': 25, 'gender': 'm'
}

print("Test 1: All zeros")
try:
    response = requests.post('http://localhost:8001/api/assessment/behavioral', 
                           json=test_data, timeout=5)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Success!")
        result = response.json()
        print(f"Prediction: {result.get('prediction')}")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

print("\nTest 2: Test API endpoint")
try:
    response = requests.get('http://localhost:8001/api/test', timeout=5)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✅ API test successful!")
        print(response.text)
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")
