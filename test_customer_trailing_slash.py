#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
TIMEOUT = 30  # seconds

# Global variables to store auth tokens and IDs
ACCESS_TOKEN = None
COMPANY_ID = None
CUSTOMER_ID = None

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2)

def test_login_demo_user():
    """Test login with demo user"""
    global ACCESS_TOKEN
    
    try:
        print("\n🔍 Testing login with demo user...")
        payload = {
            "email": "demo@quickbooks.com",
            "password": "Password123!",
            "device_info": {"browser": "python-requests", "os": "test-environment"},
            "remember_me": False
        }
        
        response = requests.post(
            f"{API_URL}/auth/login", 
            json=payload, 
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                ACCESS_TOKEN = data["access_token"]
                print("✅ Demo user login test passed")
                return True
        
        print(f"❌ Demo user login test failed: Status code {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Demo user login test failed: {str(e)}")
        return False

def test_get_user_companies():
    """Test getting user companies"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get user companies test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing get user companies...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"Using company ID: {COMPANY_ID}")
                print("✅ Get user companies test passed")
                return True
        
        print(f"❌ Get user companies test failed: Status code {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Get user companies test failed: {str(e)}")
        return False

def test_company_access():
    """Test company access"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Company access test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing company access for company ID: {COMPANY_ID}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.post(f"{API_URL}/auth/companies/{COMPANY_ID}/access", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and data.get("message") == "Company access granted":
                print("✅ Company access test passed")
                return True
        
        print(f"❌ Company access test failed: Status code {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Company access test failed: {str(e)}")
        return False

def test_customer_center_trailing_slash_fix():
    """Test Customer Center API trailing slash fix - both paths should work without redirects"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Customer Center trailing slash test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Customer Center API trailing slash fix...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test 1: GET /api/companies/{company_id}/customers (without trailing slash)
        print("\n  Testing WITHOUT trailing slash...")
        response_without_slash = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers", 
            headers=headers, 
            timeout=TIMEOUT,
            allow_redirects=False  # Don't follow redirects to detect 307s
        )
        print(f"  Status Code: {response_without_slash.status_code}")
        
        # Test 2: GET /api/companies/{company_id}/customers/ (with trailing slash)
        print("\n  Testing WITH trailing slash...")
        response_with_slash = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/", 
            headers=headers, 
            timeout=TIMEOUT,
            allow_redirects=False  # Don't follow redirects to detect 307s
        )
        print(f"  Status Code: {response_with_slash.status_code}")
        
        # Verify both responses
        success_count = 0
        
        # Check response without trailing slash
        if response_without_slash.status_code == 200:
            try:
                data_without = response_without_slash.json()
                if "items" in data_without and "total" in data_without:
                    print(f"  ✅ WITHOUT trailing slash: Found {data_without['total']} customers")
                    success_count += 1
                    if data_without["total"] > 0:
                        CUSTOMER_ID = data_without["items"][0]["customer_id"]
                        print(f"  Using customer ID: {CUSTOMER_ID}")
                else:
                    print(f"  ❌ WITHOUT trailing slash: Unexpected response structure")
            except:
                print(f"  ❌ WITHOUT trailing slash: Invalid JSON response")
        elif response_without_slash.status_code == 307:
            print(f"  ❌ WITHOUT trailing slash: Got 307 redirect (Authorization header lost)")
        elif response_without_slash.status_code == 403:
            print(f"  ❌ WITHOUT trailing slash: Got 403 Forbidden (likely due to redirect losing auth)")
        else:
            print(f"  ❌ WITHOUT trailing slash: Status code {response_without_slash.status_code}")
        
        # Check response with trailing slash
        if response_with_slash.status_code == 200:
            try:
                data_with = response_with_slash.json()
                if "items" in data_with and "total" in data_with:
                    print(f"  ✅ WITH trailing slash: Found {data_with['total']} customers")
                    success_count += 1
                    if not CUSTOMER_ID and data_with["total"] > 0:
                        CUSTOMER_ID = data_with["items"][0]["customer_id"]
                        print(f"  Using customer ID: {CUSTOMER_ID}")
                else:
                    print(f"  ❌ WITH trailing slash: Unexpected response structure")
            except:
                print(f"  ❌ WITH trailing slash: Invalid JSON response")
        elif response_with_slash.status_code == 307:
            print(f"  ❌ WITH trailing slash: Got 307 redirect (Authorization header lost)")
        elif response_with_slash.status_code == 403:
            print(f"  ❌ WITH trailing slash: Got 403 Forbidden (likely due to redirect losing auth)")
        else:
            print(f"  ❌ WITH trailing slash: Status code {response_with_slash.status_code}")
        
        # Final assessment
        if success_count == 2:
            print("✅ Customer Center trailing slash fix test PASSED - Both endpoints work correctly")
            return True
        elif success_count == 1:
            print("⚠️ Customer Center trailing slash fix test PARTIAL - Only one endpoint works")
            return False
        else:
            print("❌ Customer Center trailing slash fix test FAILED - Neither endpoint works")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Customer Center trailing slash test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Customer Center trailing slash test failed: {str(e)}")
        return False

def main():
    """Main test function focused on Customer Center API trailing slash fix validation"""
    print("🚀 Starting Customer Center API Trailing Slash Fix Validation Tests")
    print(f"Testing against: {API_URL}")
    print("🎯 FOCUS: Validate trailing slash fix to prevent 307 redirects and Authorization header loss")
    
    # Track test results
    test_results = []
    
    # Authentication tests
    test_results.append(("Demo User Login", test_login_demo_user()))
    test_results.append(("Get User Companies", test_get_user_companies()))
    test_results.append(("Company Access", test_company_access()))
    
    print("\n" + "="*80)
    print("🎯 CUSTOMER CENTER API TRAILING SLASH FIX VALIDATION")
    print("="*80)
    
    # Customer Center trailing slash fix validation
    test_results.append(("Customer Center Trailing Slash Fix", test_customer_center_trailing_slash_fix()))
    
    # Print summary
    print("\n" + "="*80)
    print("📊 CUSTOMER CENTER API TRAILING SLASH FIX TEST SUMMARY")
    print("="*80)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<40} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("="*80)
    print(f"Total Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
    
    # Focus on the trailing slash fix test
    trailing_slash_test_result = test_results[3][1]  # Customer Center Trailing Slash Fix test
    
    print("\n🔍 TRAILING SLASH FIX VALIDATION RESULTS:")
    if trailing_slash_test_result:
        print("✅ SUCCESS: Customer Center API trailing slash fix is working correctly")
        print("   - Both /customers and /customers/ endpoints return 200 status codes")
        print("   - No 307 redirects detected")
        print("   - No 403 authentication errors")
        print("   - Authorization headers are preserved")
        print("   - Customer data is returned properly from both endpoints")
    else:
        print("❌ FAILURE: Customer Center API trailing slash fix has issues")
        print("   - One or both endpoints may be returning errors")
        print("   - Possible 307 redirects causing Authorization header loss")
        print("   - Possible 403 Forbidden errors due to lost authentication")
        print("   - Review the detailed test output above for specific issues")
    
    if failed == 0:
        print("\n🎉 All tests passed! Customer Center API trailing slash fix is working correctly.")
        return True
    else:
        print(f"\n⚠️ {failed} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    main()