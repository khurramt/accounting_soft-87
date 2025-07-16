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

def test_get_customers():
    """Test getting customers"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get customers test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get customers...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data and "total" in data:
                if data["total"] > 0:
                    CUSTOMER_ID = data["items"][0]["customer_id"]
                    print(f"Using customer ID: {CUSTOMER_ID}")
                print(f"✅ Get customers test passed (Found {data['total']} customers)")
                return True
            else:
                print(f"❌ Get customers test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customers test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get customers test failed: {str(e)}")
        return False

def test_get_customer_transactions():
    """Test getting customer transactions"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID:
        print("❌ Get customer transactions test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get customer transactions for customer ID: {CUSTOMER_ID}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{CUSTOMER_ID}/transactions", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "transactions" in data and "total" in data:
                print(f"✅ Get customer transactions test passed (Found {data['total']} transactions)")
                return True
            else:
                print(f"❌ Get customer transactions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customer transactions test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get customer transactions test failed: {str(e)}")
        return False

def test_get_customer_balance():
    """Test getting customer balance"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID:
        print("❌ Get customer balance test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get customer balance for customer ID: {CUSTOMER_ID}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{CUSTOMER_ID}/balance", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "customer_id" in data and "balance" in data and "currency" in data:
                print(f"✅ Get customer balance test passed (Balance: {data['balance']} {data['currency']})")
                return True
            else:
                print(f"❌ Get customer balance test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customer balance test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get customer balance test failed: {str(e)}")
        return False

def main():
    """Main test function for comprehensive Customer Center API testing"""
    print("🚀 Starting Comprehensive Customer Center API Testing")
    print(f"Testing against: {API_URL}")
    print("🎯 FOCUS: Validate all Customer Center API endpoints are working correctly")
    
    # Track test results
    test_results = []
    
    # Authentication tests
    test_results.append(("Demo User Login", test_login_demo_user()))
    test_results.append(("Get User Companies", test_get_user_companies()))
    test_results.append(("Company Access", test_company_access()))
    
    print("\n" + "="*80)
    print("🎯 CUSTOMER CENTER API COMPREHENSIVE TESTING")
    print("="*80)
    
    # Customer Center API tests
    test_results.append(("Get Customers", test_get_customers()))
    test_results.append(("Get Customer Transactions", test_get_customer_transactions()))
    test_results.append(("Get Customer Balance", test_get_customer_balance()))
    
    # Print summary
    print("\n" + "="*80)
    print("📊 CUSTOMER CENTER API COMPREHENSIVE TEST SUMMARY")
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
    
    # Focus on the Customer Center API tests
    customer_api_tests = test_results[3:]  # Customer Center API tests
    customer_api_passed = sum(1 for _, result in customer_api_tests if result)
    
    print("\n🔍 CUSTOMER CENTER API VALIDATION RESULTS:")
    if customer_api_passed == len(customer_api_tests):
        print("✅ SUCCESS: All Customer Center API endpoints are working correctly")
        print("   - GET /customers endpoint returns customer list")
        print("   - GET /customers/{id}/transactions endpoint returns transaction data")
        print("   - GET /customers/{id}/balance endpoint returns balance information")
        print("   - All endpoints return 200 status codes with proper data structures")
        print("   - No authentication errors detected")
    else:
        print("❌ FAILURE: Some Customer Center API endpoints have issues")
        print(f"   - {customer_api_passed}/{len(customer_api_tests)} endpoints working correctly")
        print("   - Review the detailed test output above for specific issues")
    
    if failed == 0:
        print("\n🎉 All tests passed! Customer Center API is working correctly.")
        return True
    else:
        print(f"\n⚠️ {failed} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    main()