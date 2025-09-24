import requests
import json

print("🧪 Testing Local ASD Detection App")
print("=" * 40)

# Test health endpoint
print("\n1. Testing Health Endpoint:")
try:
    response = requests.get('http://localhost:8000/health', timeout=5)
    if response.status_code == 200:
        health = response.json()
        print(f"   ✅ Status: {health.get('status', 'unknown')}")
        print(f"   🤖 Models: {health.get('models_loaded', 'unknown')}")
        print(f"   📊 Version: {health.get('server_version', 'unknown')}")
    else:
        print(f"   ❌ Health check failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ Health check error: {e}")

# Test behavioral assessment
print("\n2. Testing Behavioral Assessment:")
test_data = {
    'A1_Score': 1.0, 'A2_Score': 1.0, 'A3_Score': 1.0, 'A4_Score': 1.0, 'A5_Score': 1.0,
    'A6_Score': 1.0, 'A7_Score': 1.0, 'A8_Score': 1.0, 'A9_Score': 1.0, 'A10_Score': 1.0,
    'age': 25, 'gender': 'm'
}

try:
    response = requests.post('http://localhost:8000/api/assessment/behavioral', 
                           json=test_data, timeout=10)
    if response.status_code == 200:
        result = response.json()
        prediction = result.get('prediction', 'N/A')
        probability = result.get('probability', 'N/A')
        method = result.get('model_results', {}).get('method', 'N/A')
        
        print(f"   ✅ Prediction: {prediction}")
        print(f"   📊 Probability: {probability:.3f}")
        print(f"   🔧 Method: {method}")
        
        if 'ML' in str(result.get('explanation', {}).get('method', '')):
            print(f"   🤖 Using ML models!")
        else:
            print(f"   💡 Using fallback method")
    else:
        print(f"   ❌ Assessment failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"   ❌ Assessment error: {e}")

print(f"\n" + "=" * 40)
print("🎉 Local app testing completed!")
print("🌐 Open http://localhost:8000 in your browser to use the app!")
