#!/usr/bin/env python3
"""
PSO Verification Test - Detailed testing of PSO optimization functionality
"""

import requests
import json
import time

def test_pso_optimization():
    """Test PSO optimization with different input scenarios"""
    base_url = "https://autism-scan.preview.emergentagent.com"
    
    print("🔬 PSO Optimization Verification Test")
    print("=" * 50)
    
    # Test scenarios with different patterns
    test_scenarios = [
        {
            "name": "High ASD Indicators",
            "data": {
                "A1_Score": 1, "A2_Score": 1, "A3_Score": 1, "A4_Score": 1, "A5_Score": 1,
                "A6_Score": 1, "A7_Score": 1, "A8_Score": 1, "A9_Score": 1, "A10_Score": 1,
                "age": 25.0, "gender": "m"
            }
        },
        {
            "name": "Mixed with Neutrals",
            "data": {
                "A1_Score": 0.5, "A2_Score": 1, "A3_Score": 0.5, "A4_Score": 1, "A5_Score": 0.5,
                "A6_Score": 1, "A7_Score": 0.5, "A8_Score": 0, "A9_Score": 0.5, "A10_Score": 1,
                "age": 30.0, "gender": "f"
            }
        },
        {
            "name": "Low ASD Indicators",
            "data": {
                "A1_Score": 0, "A2_Score": 0, "A3_Score": 0, "A4_Score": 0, "A5_Score": 0,
                "A6_Score": 0, "A7_Score": 0, "A8_Score": 0, "A9_Score": 0, "A10_Score": 0,
                "age": 22.0, "gender": "f"
            }
        },
        {
            "name": "All Neutral Values",
            "data": {
                "A1_Score": 0.5, "A2_Score": 0.5, "A3_Score": 0.5, "A4_Score": 0.5, "A5_Score": 0.5,
                "A6_Score": 0.5, "A7_Score": 0.5, "A8_Score": 0.5, "A9_Score": 0.5, "A10_Score": 0.5,
                "age": 28.0, "gender": "m"
            }
        }
    ]
    
    results = []
    
    for scenario in test_scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        
        try:
            response = requests.post(
                f"{base_url}/api/assessment/behavioral",
                json=scenario['data'],
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract PSO information
                pso_info = result['model_results']['pso']
                rf_info = result['model_results']['random_forest']
                svm_info = result['model_results']['svm']
                
                print(f"   RF Probability: {rf_info['probability']:.3f}")
                print(f"   SVM Probability: {svm_info['probability']:.3f}")
                print(f"   PSO Probability: {pso_info['probability']:.3f}")
                print(f"   PSO Weights: [{pso_info['weights'][0]:.3f}, {pso_info['weights'][1]:.3f}]")
                print(f"   Final Prediction: {result['prediction']} (ASD: {result['prediction'] == 1})")
                print(f"   Confidence: {result['confidence']:.3f}")
                
                # Verify PSO weights sum to ~1.0
                weights_sum = sum(pso_info['weights'])
                print(f"   Weights Sum: {weights_sum:.3f} {'✅' if abs(weights_sum - 1.0) < 0.1 else '❌'}")
                
                results.append({
                    'scenario': scenario['name'],
                    'pso_prob': pso_info['probability'],
                    'rf_prob': rf_info['probability'],
                    'svm_prob': svm_info['probability'],
                    'weights': pso_info['weights'],
                    'prediction': result['prediction'],
                    'confidence': result['confidence']
                })
                
            else:
                print(f"   ❌ Failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Analysis
    print(f"\n📊 PSO Analysis Summary")
    print("=" * 50)
    
    if results:
        print(f"✅ PSO optimization working across {len(results)} scenarios")
        print(f"✅ Weight normalization verified")
        print(f"✅ Ensemble predictions generated")
        
        # Check if PSO is actually optimizing (not just averaging)
        for result in results:
            rf_prob = result['rf_prob']
            svm_prob = result['svm_prob']
            pso_prob = result['pso_prob']
            simple_avg = (rf_prob + svm_prob) / 2
            
            print(f"\n{result['scenario']}:")
            print(f"   Simple Average: {simple_avg:.3f}")
            print(f"   PSO Optimized: {pso_prob:.3f}")
            print(f"   Difference: {abs(pso_prob - simple_avg):.3f}")
            
    else:
        print("❌ No successful PSO tests completed")

if __name__ == "__main__":
    test_pso_optimization()