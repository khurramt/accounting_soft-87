#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime

# Get the backend URL from the frontend .env file
def get_backend_url():
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.strip().split('=')[1].strip('"\'')
    return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("Error: Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Set a timeout for all requests
TIMEOUT = 10  # seconds

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        print("Testing root endpoint...")
        response = requests.get(f"{API_URL}/", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Root endpoint test passed")
                return True
            else:
                print(f"❌ Root endpoint test failed: Unexpected response: {data}")
                return False
        else:
            print(f"❌ Root endpoint test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Root endpoint test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_create_status_check():
    """Test creating a status check"""
    try:
        print("Testing create status check endpoint...")
        payload = {"client_name": "TestClient"}
        response = requests.post(f"{API_URL}/status", json=payload, timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data.get("client_name") == "TestClient" and "id" in data and "timestamp" in data:
                print("✅ Create status check test passed")
                return True, data
            else:
                print(f"❌ Create status check test failed: Unexpected response: {data}")
                return False, None
        else:
            print(f"❌ Create status check test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create status check test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create status check test failed: {str(e)}")
        return False, None

def test_get_status_checks():
    """Test getting status checks"""
    try:
        print("Testing get status checks endpoint...")
        response = requests.get(f"{API_URL}/status", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get status checks test passed: Retrieved {len(data)} status checks")
                return True
            else:
                print(f"❌ Get status checks test failed: Unexpected response: {data}")
                return False
        else:
            print(f"❌ Get status checks test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get status checks test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get status checks test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall status"""
    print("\n🔍 Starting backend API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {
        "root_endpoint": test_root_endpoint(),
        "create_status": False,
        "get_status": False
    }
    
    # Only run the create and get tests if the root endpoint test passed
    if results["root_endpoint"]:
        create_result, _ = test_create_status_check()
        results["create_status"] = create_result
        
        # Only run the get test if the create test passed
        if results["create_status"]:
            results["get_status"] = test_get_status_checks()
    
    # Print summary
    print("\n📊 Test Summary:")
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    # Overall result
    all_passed = all(results.values())
    print(f"\n🏁 Overall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return all_passed

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)