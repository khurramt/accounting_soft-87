#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import decimal
from typing import Dict, Any, Optional, Tuple, List
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
TIMEOUT = 10  # seconds

# Global variables to store auth tokens and IDs
ACCESS_TOKEN = None
REFRESH_TOKEN = None
USER_ID = None
COMPANY_ID = None

# Custom JSON encoder to handle decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def pretty_print_json(data):
    """Print JSON data with proper formatting and decimal handling"""
    return json.dumps(data, indent=2, cls=DecimalEncoder)

def test_login_demo_user():
    """Test login with demo user"""
    global ACCESS_TOKEN, REFRESH_TOKEN, USER_ID
    
    try:
        print("\n🔍 Testing login with demo user...")
        payload = {
            "email": "demo@quickbooks.com",
            "password": "Password123!",
            "device_info": {"browser": "python-requests", "os": "test-environment"},
            "remember_me": False
        }
        
        # Use requests with verify=False to bypass SSL verification
        response = requests.post(
            f"{API_URL}/auth/login", 
            json=payload, 
            timeout=TIMEOUT,
            verify=False  # Disable SSL verification
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "access_token" in data and "refresh_token" in data and "user" in data:
                ACCESS_TOKEN = data["access_token"]
                REFRESH_TOKEN = data["refresh_token"]
                USER_ID = data["user"]["user_id"]
                print("✅ Demo user login test passed")
                return True
            else:
                print(f"❌ Demo user login test failed: Unexpected response")
                return False
        else:
            print(f"❌ Demo user login test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Demo user login test failed: Request timed out after {TIMEOUT} seconds")
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
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                # Store company ID if available
                if len(data) > 0:
                    COMPANY_ID = data[0]["company"]["company_id"]
                    print(f"Using company ID: {COMPANY_ID}")
                print("✅ Get user companies test passed")
                return True
            else:
                print(f"❌ Get user companies test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get user companies test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get user companies test failed: Request timed out after {TIMEOUT} seconds")
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
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and data.get("message") == "Company access granted":
                print("✅ Company access test passed")
                return True
            else:
                print(f"❌ Company access test failed: Unexpected response")
                return False
        else:
            print(f"❌ Company access test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Company access test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Company access test failed: {str(e)}")
        return False

# ===== CUSTOMERS API TESTS =====

def test_create_customer():
    """Test creating a customer"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create customer test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create customer...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique customer name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "customer_name": f"Test Customer {timestamp}",
            "company_name": "Test Company LLC",
            "customer_type": "business",
            "first_name": "John",
            "last_name": "Doe",
            "email": f"test.customer.{timestamp}@example.com",
            "phone": "555-123-4567",
            "address_line1": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "country": "US"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/customers/", 
            headers=headers, 
            json=payload, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False, None
        
        if response.status_code == 201:
            if "customer_id" in data and data.get("customer_name") == payload["customer_name"]:
                customer_id = data["customer_id"]
                print(f"✅ Create customer test passed (ID: {customer_id})")
                return True, customer_id
            else:
                print(f"❌ Create customer test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create customer test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create customer test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create customer test failed: {str(e)}")
        return False, None

def test_get_customers():
    """Test getting customers with filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get customers test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get customers with filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "customer_name",
            "sort_order": "asc",
            "is_active": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/", 
            headers=headers, 
            params=params,
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
            if "items" in data and "total" in data and "page" in data:
                print(f"✅ Get customers test passed (Found {data['total']} customers)")
                return True
            else:
                print(f"❌ Get customers test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customers test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get customers test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get customers test failed: {str(e)}")
        return False

def test_get_customer_by_id(customer_id):
    """Test getting a customer by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not customer_id:
        print("❌ Get customer by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get customer by ID: {customer_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{customer_id}", 
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
            if "customer_id" in data and data["customer_id"] == customer_id:
                print("✅ Get customer by ID test passed")
                return True
            else:
                print(f"❌ Get customer by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customer by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get customer by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get customer by ID test failed: {str(e)}")
        return False

def test_update_customer(customer_id):
    """Test updating a customer"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not customer_id:
        print("❌ Update customer test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update customer: {customer_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated customer data
        payload = {
            "customer_name": f"Updated Customer {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "555-987-6543",
            "address_line1": "456 Updated St"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{customer_id}", 
            headers=headers, 
            json=payload,
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
            if "customer_id" in data and data["customer_id"] == customer_id and data["customer_name"] == payload["customer_name"]:
                print("✅ Update customer test passed")
                return True
            else:
                print(f"❌ Update customer test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update customer test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update customer test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update customer test failed: {str(e)}")
        return False

def test_delete_customer(customer_id):
    """Test deleting a customer (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not customer_id:
        print("❌ Delete customer test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete customer: {customer_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{customer_id}", 
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
            if "message" in data and "deleted" in data["message"].lower():
                print("✅ Delete customer test passed")
                return True
            else:
                print(f"❌ Delete customer test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete customer test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete customer test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete customer test failed: {str(e)}")
        return False

def test_get_customer_transactions(customer_id):
    """Test getting customer transactions"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not customer_id:
        print("❌ Get customer transactions test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get customer transactions: {customer_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{customer_id}/transactions", 
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
            if "transactions" in data:
                print("✅ Get customer transactions test passed")
                return True
            else:
                print(f"❌ Get customer transactions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customer transactions test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get customer transactions test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get customer transactions test failed: {str(e)}")
        return False

def test_get_customer_balance(customer_id):
    """Test getting customer balance"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not customer_id:
        print("❌ Get customer balance test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get customer balance: {customer_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{customer_id}/balance", 
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
            if "customer_id" in data and "balance" in data:
                print("✅ Get customer balance test passed")
                return True
            else:
                print(f"❌ Get customer balance test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get customer balance test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get customer balance test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get customer balance test failed: {str(e)}")
        return False

def test_customer_search_and_filtering():
    """Test customer search and filtering functionality"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Customer search and filtering test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing customer search and filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with various filtering parameters
        test_cases = [
            {
                "name": "Search by name",
                "params": {"search": "Test", "page": 1, "page_size": 10}
            },
            {
                "name": "Filter by customer_type",
                "params": {"customer_type": "business", "page": 1, "page_size": 10}
            },
            {
                "name": "Filter by city",
                "params": {"city": "Test City", "page": 1, "page_size": 10}
            },
            {
                "name": "Filter by state",
                "params": {"state": "TS", "page": 1, "page_size": 10}
            },
            {
                "name": "Filter by active status",
                "params": {"is_active": "true", "page": 1, "page_size": 10}
            },
            {
                "name": "Sort by name descending",
                "params": {"sort_by": "customer_name", "sort_order": "desc", "page": 1, "page_size": 10}
            },
            {
                "name": "Pagination test",
                "params": {"page": 1, "page_size": 5}
            }
        ]
        
        success = True
        
        for test_case in test_cases:
            print(f"\n  Testing {test_case['name']}...")
            
            response = requests.get(
                f"{API_URL}/companies/{COMPANY_ID}/customers/", 
                headers=headers, 
                params=test_case['params'],
                timeout=TIMEOUT
            )
            print(f"  Status Code: {response.status_code}")
            
            try:
                data = response.json()
                print(f"  Response: {pretty_print_json(data)}")
            except:
                print(f"  Response: {response.text}")
                success = False
                continue
            
            if response.status_code == 200:
                if "items" in data and "total" in data and "page" in data:
                    print(f"  ✅ {test_case['name']} test passed")
                else:
                    print(f"  ❌ {test_case['name']} test failed: Unexpected response")
                    success = False
            else:
                print(f"  ❌ {test_case['name']} test failed: Status code {response.status_code}")
                success = False
        
        return success
    except requests.exceptions.Timeout:
        print(f"❌ Customer search and filtering test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Customer search and filtering test failed: {str(e)}")
        return False

def test_invalid_company_access():
    """Test accessing customer data with invalid company ID"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Invalid company access test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing customer access with invalid company ID...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Use a non-existent company ID
        invalid_company_id = "00000000-0000-0000-0000-000000000000"
        
        response = requests.get(
            f"{API_URL}/companies/{invalid_company_id}/customers/", 
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
        
        if response.status_code == 403:
            print("✅ Invalid company access test passed (received 403 Forbidden)")
            return True
        else:
            print(f"❌ Invalid company access test failed: Expected 403, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invalid company access test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invalid company access test failed: {str(e)}")
        return False

def test_invalid_customer_id():
    """Test accessing customer with invalid customer ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Invalid customer ID test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing access with invalid customer ID...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Use a non-existent customer ID
        invalid_customer_id = "00000000-0000-0000-0000-000000000000"
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/customers/{invalid_customer_id}", 
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
        
        if response.status_code == 404:
            print("✅ Invalid customer ID test passed (received 404 Not Found)")
            return True
        else:
            print(f"❌ Invalid customer ID test failed: Expected 404, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invalid customer ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invalid customer ID test failed: {str(e)}")
        return False

def test_invalid_customer_data():
    """Test creating customer with invalid data"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Invalid customer data test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing create customer with invalid data...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Missing required fields
        payload = {
            # Missing customer_name which is required
            "company_name": "Test Company LLC",
            "customer_type": "business"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/customers/", 
            headers=headers, 
            json=payload, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 400 or response.status_code == 422:
            print("✅ Invalid customer data test passed (received 400 Bad Request or 422 Unprocessable Entity)")
            return True
        else:
            print(f"❌ Invalid customer data test failed: Expected 400 or 422, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invalid customer data test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invalid customer data test failed: {str(e)}")
        return False

def run_customer_management_tests():
    """Run all customer management tests"""
    print("\n🔍 RUNNING CUSTOMER MANAGEMENT INTEGRATION TESTS")
    
    # First, ensure we're logged in and have company access
    if not test_login_demo_user():
        print("❌ Customer management tests aborted: Login failed")
        return False
    
    if not test_get_user_companies():
        print("❌ Customer management tests aborted: Failed to get user companies")
        return False
    
    if not test_company_access():
        print("❌ Customer management tests aborted: Failed to get company access")
        return False
    
    # Track test results
    results = {}
    
    # Run customer CRUD tests
    success, customer_id = test_create_customer()
    results["create_customer"] = success
    
    if not success:
        print("❌ Customer CRUD tests failed: Could not create customer")
    else:
        results["get_customers"] = test_get_customers()
        results["get_customer_by_id"] = test_get_customer_by_id(customer_id)
        results["update_customer"] = test_update_customer(customer_id)
        results["get_customer_transactions"] = test_get_customer_transactions(customer_id)
        results["get_customer_balance"] = test_get_customer_balance(customer_id)
        results["delete_customer"] = test_delete_customer(customer_id)
    
    # Run customer search and filtering tests
    results["customer_search_and_filtering"] = test_customer_search_and_filtering()
    
    # Run error handling tests
    results["invalid_company_access"] = test_invalid_company_access()
    results["invalid_customer_id"] = test_invalid_customer_id()
    results["invalid_customer_data"] = test_invalid_customer_data()
    
    # Overall result
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All Customer Management Integration tests passed!")
    else:
        print("\n❌ Some Customer Management Integration tests failed:")
        for test, passed in results.items():
            status = "✅" if passed else "❌"
            print(f"{status} {test}")
    
    return all_passed

if __name__ == "__main__":
    run_customer_management_tests()