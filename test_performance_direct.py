#!/usr/bin/env python3
"""
Recent Transactions API Performance Test Results
"""
import requests
import time
import json

def test_recent_transactions_performance_direct():
    """Direct test of Recent Transactions API performance"""
    
    print("=" * 80)
    print("🎯 RECENT TRANSACTIONS API PERFORMANCE TEST RESULTS")
    print("=" * 80)
    
    # Test configuration
    API_URL = "https://e161fea9-c368-4912-852a-0879ba645ab1.preview.emergentagent.com/api"
    COMPANY_ID = "5e7b5c9b-b5c3-4c9a-8e94-cd978db8b1d2"
    ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM1NzgwMzktODIxYy00YThjLWI3YzktZTAwZTNhOGZkMjU2Iiwic2Vzc2lvbl9pZCI6IjIzMDk3ZWE3LWMwNjAtNGRmNi1hZmZmLTA1OWZlODM4MmM5ZSIsImV4cCI6MTc1MjYxNTM3MSwiaWF0IjoxNzUyNjE0NDcxLCJ0eXBlIjoiYWNjZXNzIn0.G2-OrsDFXbHbQbvDVU4nyt0-QbVfMtmXA0y0eS29M_E"
    
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    print("📊 TEST CONFIGURATION:")
    print(f"   - API URL: {API_URL}")
    print(f"   - Company ID: {COMPANY_ID}")
    print(f"   - Endpoint: /companies/{COMPANY_ID}/transactions?recent=true")
    print(f"   - Timeout: 15 seconds")
    print(f"   - Expected: Response under 10 seconds")
    
    print("\n⏱️  PERFORMANCE TEST EXECUTION:")
    
    try:
        start_time = time.time()
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/transactions?recent=true",
            headers=headers,
            timeout=15,
            verify=False
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"   ✅ Response received in {response_time:.2f} seconds")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Response structure: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                if isinstance(data, dict) and "items" in data:
                    transactions = data["items"]
                    print(f"   Transactions returned: {len(transactions)}")
                    
                    # Performance assessment
                    if response_time < 10:
                        print(f"\n🎉 PERFORMANCE RESULT: EXCELLENT")
                        print(f"   ✅ Response time ({response_time:.2f}s) is under 10 seconds")
                        print(f"   ✅ API performance issue appears to be RESOLVED")
                        return True
                    else:
                        print(f"\n⚠️  PERFORMANCE RESULT: POOR")
                        print(f"   ❌ Response time ({response_time:.2f}s) exceeds 10 second requirement")
                        print(f"   ❌ API performance issue is NOT resolved")
                        return False
                else:
                    print(f"   ❌ Unexpected response structure")
                    return False
            except json.JSONDecodeError:
                print(f"   ❌ Invalid JSON response")
                return False
        else:
            print(f"   ❌ HTTP error: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"   ❌ REQUEST TIMED OUT after 15 seconds")
        print(f"\n❌ PERFORMANCE RESULT: CRITICAL FAILURE")
        print(f"   ❌ The Recent Transactions API is still timing out")
        print(f"   ❌ Performance optimization has NOT resolved the issue")
        print(f"   ❌ API takes longer than 15 seconds (exceeds 10s requirement)")
        return False
    except Exception as e:
        print(f"   ❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    result = test_recent_transactions_performance_direct()
    
    print("\n" + "=" * 80)
    print("📋 FINAL ASSESSMENT")
    print("=" * 80)
    
    if result:
        print("🎉 SUCCESS: Recent Transactions API performance issue has been RESOLVED")
        print("   The API now responds within the required 10-second threshold")
    else:
        print("❌ FAILURE: Recent Transactions API performance issue is NOT resolved")
        print("   The API still has timeout/performance problems")
        print("   Further optimization work is required")
    
    print("=" * 80)