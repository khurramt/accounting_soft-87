#!/usr/bin/env python3
"""
Customer Center Trailing Slash Fix Validation Test

This test validates that the Customer Center API endpoints work correctly
with both trailing slash and without trailing slash, confirming the fix
for the redirect issue that was causing 403 errors.
"""

import requests
import json
import sys
import urllib3
from datetime import datetime

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
print(f"🔗 Using API URL: {API_URL}")

TIMEOUT = 30

# Global variables
ACCESS_TOKEN = None
COMPANY_ID = None

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2, default=str)

def login_demo_user():
    """Login with demo credentials"""
    global ACCESS_TOKEN
    
    print("\n🔐 Logging in with demo credentials...")
    payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login", 
            json=payload, 
            timeout=TIMEOUT,
            verify=False
        )
        
        if response.status_code == 200:
            data = response.json()
            ACCESS_TOKEN = data["access_token"]
            print("✅ Login successful")
            return True
        else:
            print(f"❌ Login failed: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login failed: {str(e)}")
        return False

def get_company_access():
    """Get company access"""
    global COMPANY_ID
    
    if not ACCESS_TOKEN:
        return False
    
    print("\n🏢 Getting company access...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    try:
        # First get user companies
        response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
        if response.status_code == 200:
            companies = response.json()
            if len(companies) > 0:
                COMPANY_ID = companies[0]["company"]["company_id"]
                print(f"Found company ID: {COMPANY_ID}")
                
                # Get company access
                access_response = requests.post(
                    f"{API_URL}/auth/companies/{COMPANY_ID}/access", 
                    headers=headers, 
                    timeout=TIMEOUT
                )
                
                if access_response.status_code == 200:
                    print("✅ Company access granted")
                    return True
                else:
                    print(f"❌ Company access failed: Status {access_response.status_code}")
                    return False
            else:
                print("❌ No companies found")
                return False
        else:
            print(f"❌ Get companies failed: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Company access failed: {str(e)}")
        return False

def test_customer_endpoint_without_trailing_slash():
    """Test GET /api/companies/{company_id}/customers (without trailing slash)"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Test skipped: Missing authentication data")
        return False
    
    print(f"\n🧪 Testing Customer API WITHOUT trailing slash...")
    print(f"URL: {API_URL}/companies/{COMPANY_ID}/customers")
    
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    try:
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers",  # NO trailing slash
            headers=headers,
            timeout=TIMEOUT,
            allow_redirects=False  # Don't follow redirects to detect 307
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Check for redirect
        if response.status_code == 307:
            print("❌ REDIRECT DETECTED: 307 Temporary Redirect")
            print(f"Location header: {response.headers.get('Location', 'Not found')}")
            return False
        elif response.status_code == 403:
            print("❌ AUTHENTICATION FAILED: 403 Forbidden")
            return False
        elif response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ SUCCESS: 200 OK")
                print(f"Response structure: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                if isinstance(data, dict) and "items" in data:
                    print(f"Found {data.get('total', 0)} customers")
                return True
            except:
                print(f"❌ Invalid JSON response: {response.text[:200]}")
                return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_customer_endpoint_with_trailing_slash():
    """Test GET /api/companies/{company_id}/customers/ (with trailing slash)"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Test skipped: Missing authentication data")
        return False
    
    print(f"\n🧪 Testing Customer API WITH trailing slash...")
    print(f"URL: {API_URL}/companies/{COMPANY_ID}/customers/")
    
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    try:
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/",  # WITH trailing slash
            headers=headers,
            timeout=TIMEOUT,
            allow_redirects=False  # Don't follow redirects to detect 307
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        # Check for redirect
        if response.status_code == 307:
            print("❌ REDIRECT DETECTED: 307 Temporary Redirect")
            print(f"Location header: {response.headers.get('Location', 'Not found')}")
            return False
        elif response.status_code == 403:
            print("❌ AUTHENTICATION FAILED: 403 Forbidden")
            return False
        elif response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ SUCCESS: 200 OK")
                print(f"Response structure: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                if isinstance(data, dict) and "items" in data:
                    print(f"Found {data.get('total', 0)} customers")
                return True
            except:
                print(f"❌ Invalid JSON response: {response.text[:200]}")
                return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("=" * 80)
    print("🧪 CUSTOMER CENTER TRAILING SLASH FIX VALIDATION TEST")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Step 1: Login
    if not login_demo_user():
        print("\n❌ OVERALL RESULT: FAILED - Could not login")
        return False
    
    # Step 2: Get company access
    if not get_company_access():
        print("\n❌ OVERALL RESULT: FAILED - Could not get company access")
        return False
    
    # Step 3: Test without trailing slash
    test1_result = test_customer_endpoint_without_trailing_slash()
    
    # Step 4: Test with trailing slash
    test2_result = test_customer_endpoint_with_trailing_slash()
    
    # Final results
    print("\n" + "=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"✅ Login with demo credentials: SUCCESS")
    print(f"✅ Company access: SUCCESS")
    print(f"{'✅' if test1_result else '❌'} GET /customers (no trailing slash): {'SUCCESS' if test1_result else 'FAILED'}")
    print(f"{'✅' if test2_result else '❌'} GET /customers/ (with trailing slash): {'SUCCESS' if test2_result else 'FAILED'}")
    
    overall_success = test1_result and test2_result
    
    print("\n" + "=" * 80)
    if overall_success:
        print("🎉 OVERALL RESULT: SUCCESS")
        print("✅ Customer Center trailing slash fix is working correctly!")
        print("✅ Both endpoints return 200 status with proper customer data")
        print("✅ No 307 redirects or 403 errors detected")
    else:
        print("❌ OVERALL RESULT: FAILED")
        print("❌ Customer Center trailing slash fix needs attention")
        if not test1_result:
            print("❌ Endpoint without trailing slash is not working")
        if not test2_result:
            print("❌ Endpoint with trailing slash is not working")
    
    print("=" * 80)
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)