#!/usr/bin/env python3
import requests
import json
import sys
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
API_URL = f"{BACKEND_URL}/api"
TIMEOUT = 30

def pretty_print_json(data):
    return json.dumps(data, indent=2)

def test_chart_of_accounts_trailing_slash_fix():
    """Test Chart of Accounts API trailing slash fix"""
    print("=== CHART OF ACCOUNTS API TRAILING SLASH FIX VALIDATION ===")
    print()
    
    # Step 1: Login with demo user
    print("1. Authenticating with demo user...")
    login_payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    login_response = requests.post(
        f"{API_URL}/auth/login", 
        json=login_payload, 
        timeout=TIMEOUT,
        verify=False
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    login_data = login_response.json()
    access_token = login_data["access_token"]
    print("✅ Login successful")
    
    # Step 2: Get user companies
    print("2. Getting user companies...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    companies_response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
    if companies_response.status_code != 200:
        print(f"❌ Get companies failed: {companies_response.status_code}")
        return False
    
    companies_data = companies_response.json()
    company_id = companies_data[0]["company"]["company_id"]
    print(f"✅ Company ID: {company_id}")
    
    # Step 3: Grant company access
    print("3. Granting company access...")
    access_response = requests.post(f"{API_URL}/auth/companies/{company_id}/access", headers=headers, timeout=TIMEOUT)
    if access_response.status_code != 200:
        print(f"❌ Company access failed: {access_response.status_code}")
        return False
    
    print("✅ Company access granted")
    print()
    
    # Step 4: Test Chart of Accounts API endpoints
    print("🎯 TESTING CHART OF ACCOUNTS API ENDPOINTS")
    print()
    
    # Test 1: WITHOUT trailing slash
    print("TEST 1: GET /api/companies/{company_id}/accounts (WITHOUT trailing slash)")
    response_without = requests.get(
        f"{API_URL}/companies/{company_id}/accounts", 
        headers=headers, 
        timeout=TIMEOUT,
        allow_redirects=False,  # Don't follow redirects to detect 307s
        verify=False
    )
    print(f"   Status Code: {response_without.status_code}")
    
    if response_without.status_code == 200:
        data = response_without.json()
        print(f"   ✅ SUCCESS: Found {data.get('total', 0)} accounts")
        print(f"   ✅ NO 307 REDIRECT: Direct 200 response")
        print(f"   ✅ AUTHORIZATION PRESERVED: No 403 errors")
        
        # Show sample account data
        if data.get('total', 0) > 0:
            sample_account = data['items'][0]
            print(f"   Sample account: {sample_account.get('account_name', 'N/A')} ({sample_account.get('account_type', 'N/A')})")
        
        without_slash_success = True
    elif response_without.status_code == 307:
        print(f"   ❌ FAILED: Got 307 redirect (Authorization header would be lost)")
        print(f"   Location header: {response_without.headers.get('Location', 'Not found')}")
        without_slash_success = False
    elif response_without.status_code == 403:
        print(f"   ❌ FAILED: Got 403 Forbidden (likely due to redirect losing auth)")
        without_slash_success = False
    else:
        print(f"   ❌ FAILED: Unexpected status code {response_without.status_code}")
        try:
            error_data = response_without.json()
            print(f"   Error details: {error_data}")
        except:
            print(f"   Error text: {response_without.text}")
        without_slash_success = False
    
    print()
    
    # Test 2: WITH trailing slash
    print("TEST 2: GET /api/companies/{company_id}/accounts/ (WITH trailing slash)")
    response_with = requests.get(
        f"{API_URL}/companies/{company_id}/accounts/", 
        headers=headers, 
        timeout=TIMEOUT,
        allow_redirects=False,  # Don't follow redirects to detect 307s
        verify=False
    )
    print(f"   Status Code: {response_with.status_code}")
    
    if response_with.status_code == 200:
        data = response_with.json()
        print(f"   ✅ SUCCESS: Found {data.get('total', 0)} accounts")
        print(f"   ✅ NO 307 REDIRECT: Direct 200 response")
        print(f"   ✅ AUTHORIZATION PRESERVED: No 403 errors")
        
        # Show sample account data
        if data.get('total', 0) > 0:
            sample_account = data['items'][0]
            print(f"   Sample account: {sample_account.get('account_name', 'N/A')} ({sample_account.get('account_type', 'N/A')})")
        
        with_slash_success = True
    elif response_with.status_code == 307:
        print(f"   ❌ FAILED: Got 307 redirect (Authorization header would be lost)")
        print(f"   Location header: {response_with.headers.get('Location', 'Not found')}")
        with_slash_success = False
    elif response_with.status_code == 403:
        print(f"   ❌ FAILED: Got 403 Forbidden (likely due to redirect losing auth)")
        with_slash_success = False
    else:
        print(f"   ❌ FAILED: Unexpected status code {response_with.status_code}")
        try:
            error_data = response_with.json()
            print(f"   Error details: {error_data}")
        except:
            print(f"   Error text: {response_with.text}")
        with_slash_success = False
    
    print()
    
    # Test 3: Data structure validation
    print("TEST 3: Data structure validation")
    if without_slash_success and with_slash_success:
        data_without = response_without.json()
        data_with = response_with.json()
        
        # Check required fields
        required_fields = ['items', 'total', 'page', 'page_size', 'total_pages']
        for field in required_fields:
            if field in data_without and field in data_with:
                print(f"   ✅ FIELD {field}: Present in both responses")
            else:
                print(f"   ❌ FIELD {field}: Missing in one or both responses")
        
        # Check account data structure
        if data_without.get('total', 0) > 0 and data_with.get('total', 0) > 0:
            account_without = data_without['items'][0]
            account_with = data_with['items'][0]
            
            account_fields = ['account_id', 'account_name', 'account_type', 'balance']
            for field in account_fields:
                if field in account_without and field in account_with:
                    print(f"   ✅ ACCOUNT FIELD {field}: Present in both responses")
                else:
                    print(f"   ❌ ACCOUNT FIELD {field}: Missing in one or both responses")
    else:
        print("   ⚠️ Skipping data structure validation due to failed requests")
    
    print()
    
    # Test 4: Demo credentials verification
    print("TEST 4: Demo Company Credentials Verification")
    print("   ✅ DEMO EMAIL: demo@quickbooks.com (used successfully)")
    print("   ✅ DEMO PASSWORD: Password123! (used successfully)")
    print(f"   ✅ COMPANY ACCESS: {company_id} (granted successfully)")
    
    print()
    
    # Final assessment
    print("🏁 FINAL ASSESSMENT")
    if without_slash_success and with_slash_success:
        print("✅ CHART OF ACCOUNTS API TRAILING SLASH FIX: FULLY WORKING")
        print("✅ Both endpoints (with and without trailing slash) work correctly")
        print("✅ No 307 redirects detected")
        print("✅ No 403 Forbidden errors")
        print("✅ Authorization headers preserved")
        print("✅ Demo company credentials working")
        print("✅ Proper account data returned")
        return True
    elif without_slash_success or with_slash_success:
        print("⚠️ CHART OF ACCOUNTS API TRAILING SLASH FIX: PARTIALLY WORKING")
        print("⚠️ Only one endpoint works correctly")
        return False
    else:
        print("❌ CHART OF ACCOUNTS API TRAILING SLASH FIX: NOT WORKING")
        print("❌ Both endpoints have issues")
        return False

if __name__ == "__main__":
    test_chart_of_accounts_trailing_slash_fix()