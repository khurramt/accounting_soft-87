#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import decimal
from typing import Dict, Any, Optional, Tuple, List

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
SESSION_ID = None
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

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        print("\n🔍 Testing root endpoint...")
        response = requests.get(f"{API_URL}/", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
            if "message" in data:
                print("✅ Root endpoint test passed")
                return True
            else:
                print(f"❌ Root endpoint test failed: Unexpected response")
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

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        print("\n🔍 Testing health endpoint...")
        response = requests.get(f"{API_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
            if "status" in data and data["status"] == "healthy":
                print("✅ Health endpoint test passed")
                return True
            else:
                print(f"❌ Health endpoint test failed: Unexpected response")
                return False
        else:
            print(f"❌ Health endpoint test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Health endpoint test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Health endpoint test failed: {str(e)}")
        return False

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
        
        response = requests.post(f"{API_URL}/auth/login", json=payload, timeout=TIMEOUT)
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

# ===== ACCOUNTS API TESTS =====

def test_create_account():
    """Test creating an account"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create account test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create account...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique account name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "account_name": f"Test Account {timestamp}",
            "account_type": "assets",
            "description": "Test account created via API",
            "opening_balance": 1000.00
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
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
            if "account_id" in data and data.get("account_name") == payload["account_name"]:
                account_id = data["account_id"]
                print(f"✅ Create account test passed (ID: {account_id})")
                return True, account_id
            else:
                print(f"❌ Create account test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create account test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create account test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create account test failed: {str(e)}")
        return False, None

def test_get_accounts():
    """Test getting accounts with pagination"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get accounts test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get accounts with pagination...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "account_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
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
                print(f"✅ Get accounts test passed (Found {data['total']} accounts)")
                return True
            else:
                print(f"❌ Get accounts test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get accounts test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get accounts test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get accounts test failed: {str(e)}")
        return False

def test_get_account_by_id(account_id):
    """Test getting an account by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not account_id:
        print("❌ Get account by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get account by ID: {account_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/{account_id}", 
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
            if "account_id" in data and data["account_id"] == account_id:
                print("✅ Get account by ID test passed")
                return True
            else:
                print(f"❌ Get account by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get account by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get account by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get account by ID test failed: {str(e)}")
        return False

def test_update_account(account_id):
    """Test updating an account"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not account_id:
        print("❌ Update account test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update account: {account_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated account data
        payload = {
            "account_name": f"Updated Account {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Updated description via API test"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/{account_id}", 
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
            if "account_id" in data and data["account_id"] == account_id and data["account_name"] == payload["account_name"]:
                print("✅ Update account test passed")
                return True
            else:
                print(f"❌ Update account test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update account test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update account test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update account test failed: {str(e)}")
        return False

def test_delete_account(account_id):
    """Test deleting an account (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not account_id:
        print("❌ Delete account test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete account: {account_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/{account_id}", 
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
                print("✅ Delete account test passed")
                return True
            else:
                print(f"❌ Delete account test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete account test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete account test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete account test failed: {str(e)}")
        return False

def test_merge_accounts(source_account_id, target_account_id):
    """Test merging accounts"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not source_account_id or not target_account_id:
        print("❌ Merge accounts test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing merge accounts: {source_account_id} into {target_account_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "target_account_id": target_account_id
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/{source_account_id}/merge", 
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
            if "message" in data and "merged" in data["message"].lower():
                print("✅ Merge accounts test passed")
                return True
            else:
                print(f"❌ Merge accounts test failed: Unexpected response")
                return False
        else:
            print(f"❌ Merge accounts test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Merge accounts test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Merge accounts test failed: {str(e)}")
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

# ===== VENDORS API TESTS =====

def test_create_vendor():
    """Test creating a vendor"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create vendor test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create vendor...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique vendor name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "vendor_name": f"Test Vendor {timestamp}",
            "company_name": "Test Vendor Inc.",
            "vendor_type": "supplier",
            "contact_person": "Jane Smith",
            "email": f"test.vendor.{timestamp}@example.com",
            "phone": "555-987-6543",
            "address_line1": "789 Vendor St",
            "city": "Vendor City",
            "state": "VS",
            "zip_code": "54321",
            "country": "US",
            "eligible_1099": True
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
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
            if "vendor_id" in data and data.get("vendor_name") == payload["vendor_name"]:
                vendor_id = data["vendor_id"]
                print(f"✅ Create vendor test passed (ID: {vendor_id})")
                return True, vendor_id
            else:
                print(f"❌ Create vendor test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create vendor test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create vendor test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create vendor test failed: {str(e)}")
        return False, None

def test_get_vendors():
    """Test getting vendors"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get vendors test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get vendors...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "vendor_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
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
                print(f"✅ Get vendors test passed (Found {data['total']} vendors)")
                return True
            else:
                print(f"❌ Get vendors test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendors test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendors test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendors test failed: {str(e)}")
        return False

def test_get_vendor_by_id(vendor_id):
    """Test getting a vendor by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Get vendor by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get vendor by ID: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
            if "vendor_id" in data and data["vendor_id"] == vendor_id:
                print("✅ Get vendor by ID test passed")
                return True
            else:
                print(f"❌ Get vendor by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendor by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendor by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendor by ID test failed: {str(e)}")
        return False

def test_update_vendor(vendor_id):
    """Test updating a vendor"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Update vendor test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update vendor: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated vendor data
        payload = {
            "vendor_name": f"Updated Vendor {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "555-111-2222",
            "address_line1": "456 Updated Vendor St"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
            if "vendor_id" in data and data["vendor_id"] == vendor_id and data["vendor_name"] == payload["vendor_name"]:
                print("✅ Update vendor test passed")
                return True
            else:
                print(f"❌ Update vendor test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update vendor test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update vendor test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update vendor test failed: {str(e)}")
        return False

def test_delete_vendor(vendor_id):
    """Test deleting a vendor (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Delete vendor test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete vendor: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
                print("✅ Delete vendor test passed")
                return True
            else:
                print(f"❌ Delete vendor test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete vendor test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete vendor test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete vendor test failed: {str(e)}")
        return False

def test_get_vendor_transactions(vendor_id):
    """Test getting vendor transactions"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Get vendor transactions test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get vendor transactions: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}/transactions", 
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
                print("✅ Get vendor transactions test passed")
                return True
            else:
                print(f"❌ Get vendor transactions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendor transactions test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendor transactions test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendor transactions test failed: {str(e)}")
        return False

# ===== ITEMS API TESTS =====

def test_create_item():
    """Test creating an item"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create item test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create item...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique item name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "item_name": f"Test Item {timestamp}",
            "item_type": "inventory",
            "description": "Test item created via API",
            "sales_price": 49.99,
            "purchase_cost": 29.99,
            "quantity_on_hand": 10,
            "reorder_point": 25,
            "manufacturer": "Test Manufacturer"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/items/", 
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
            if "item_id" in data and data.get("item_name") == payload["item_name"]:
                item_id = data["item_id"]
                print(f"✅ Create item test passed (ID: {item_id})")
                return True, item_id
            else:
                print(f"❌ Create item test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create item test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create item test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create item test failed: {str(e)}")
        return False, None

def test_get_items():
    """Test getting items"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get items test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get items...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "item_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/items/", 
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
                print(f"✅ Get items test passed (Found {data['total']} items)")
                return True
            else:
                print(f"❌ Get items test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get items test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get items test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get items test failed: {str(e)}")
        return False

def test_get_item_by_id(item_id):
    """Test getting an item by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Get item by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get item by ID: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/items/{item_id}", 
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
            if "item_id" in data and data["item_id"] == item_id:
                print("✅ Get item by ID test passed")
                return True
            else:
                print(f"❌ Get item by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get item by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get item by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get item by ID test failed: {str(e)}")
        return False

def test_update_item(item_id):
    """Test updating an item"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Update item test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update item: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated item data
        payload = {
            "item_name": f"Updated Item {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Updated description via API test",
            "sales_price": 59.99,
            "quantity_on_hand": 75
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/items/{item_id}", 
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
            if "item_id" in data and data["item_id"] == item_id and data["item_name"] == payload["item_name"]:
                print("✅ Update item test passed")
                return True
            else:
                print(f"❌ Update item test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update item test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update item test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update item test failed: {str(e)}")
        return False

def test_delete_item(item_id):
    """Test deleting an item (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Delete item test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete item: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/items/{item_id}", 
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
                print("✅ Delete item test passed")
                return True
            else:
                print(f"❌ Delete item test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete item test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete item test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete item test failed: {str(e)}")
        return False

def test_get_low_stock_items():
    """Test getting low stock items"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get low stock items test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get low stock items...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/items/low-stock", 
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
            print("✅ Get low stock items test passed")
            return True
        else:
            print(f"❌ Get low stock items test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get low stock items test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get low stock items test failed: {str(e)}")
        return False

# ===== EMPLOYEES API TESTS =====

def test_create_employee():
    """Test creating an employee"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create employee test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create employee...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique identifier to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "first_name": "Test",
            "last_name": f"Employee {timestamp}",
            "email": f"test.employee.{timestamp}@example.com",
            "phone": "555-444-3333",
            "address_line1": "123 Employee St",
            "city": "Employee City",
            "state": "ES",
            "zip_code": "12345",
            "hire_date": "2023-01-15",
            "pay_type": "hourly",
            "hourly_rate": 25.50
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/employees/", 
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
            if "employee_id" in data and data.get("first_name") == payload["first_name"]:
                employee_id = data["employee_id"]
                print(f"✅ Create employee test passed (ID: {employee_id})")
                return True, employee_id
            else:
                print(f"❌ Create employee test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create employee test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create employee test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create employee test failed: {str(e)}")
        return False, None

def test_get_employees():
    """Test getting employees"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get employees test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get employees...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "last_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/employees/", 
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
                print(f"✅ Get employees test passed (Found {data['total']} employees)")
                return True
            else:
                print(f"❌ Get employees test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get employees test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get employees test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get employees test failed: {str(e)}")
        return False

def test_get_employee_by_id(employee_id):
    """Test getting an employee by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Get employee by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get employee by ID: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/employees/{employee_id}", 
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
            if "employee_id" in data and data["employee_id"] == employee_id:
                print("✅ Get employee by ID test passed")
                return True
            else:
                print(f"❌ Get employee by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get employee by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get employee by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get employee by ID test failed: {str(e)}")
        return False

def test_update_employee(employee_id):
    """Test updating an employee"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Update employee test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update employee: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated employee data
        payload = {
            "first_name": "Updated",
            "last_name": f"Employee {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "555-999-8888",
            "hourly_rate": 28.75
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/employees/{employee_id}", 
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
            if "employee_id" in data and data["employee_id"] == employee_id and data["first_name"] == payload["first_name"]:
                print("✅ Update employee test passed")
                return True
            else:
                print(f"❌ Update employee test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update employee test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update employee test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update employee test failed: {str(e)}")
        return False

def test_delete_employee(employee_id):
    """Test deleting an employee (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Delete employee test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete employee: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/employees/{employee_id}", 
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
                print("✅ Delete employee test passed")
                return True
            else:
                print(f"❌ Delete employee test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete employee test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete employee test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete employee test failed: {str(e)}")
        return False

def run_list_management_tests():
    """Run all List Management Module API tests"""
    print("\n🔍 Starting QuickBooks Clone List Management Module API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {}
    
    # Login and get company access
    results["login_demo_user"] = test_login_demo_user()
    if results["login_demo_user"]:
        results["get_user_companies"] = test_get_user_companies()
        if COMPANY_ID:
            results["company_access"] = test_company_access()
        else:
            print("❌ No company ID available, skipping company-specific tests")
            return False
    else:
        print("❌ Login failed, skipping all other tests")
        return False
    
    # Test Accounts API
    print("\n📋 Testing Accounts API...")
    account_result, account_id = test_create_account()
    results["create_account"] = account_result
    
    # Create a second account for merge test
    account2_result, account2_id = test_create_account()
    results["create_account2"] = account2_result
    
    results["get_accounts"] = test_get_accounts()
    
    if account_id:
        results["get_account_by_id"] = test_get_account_by_id(account_id)
        results["update_account"] = test_update_account(account_id)
        
        if account2_id:
            results["merge_accounts"] = test_merge_accounts(account_id, account2_id)
        
        results["delete_account"] = test_delete_account(account_id)
    
    # Test Customers API
    print("\n📋 Testing Customers API...")
    customer_result, customer_id = test_create_customer()
    results["create_customer"] = customer_result
    
    results["get_customers"] = test_get_customers()
    
    if customer_id:
        results["get_customer_by_id"] = test_get_customer_by_id(customer_id)
        results["update_customer"] = test_update_customer(customer_id)
        results["get_customer_transactions"] = test_get_customer_transactions(customer_id)
        results["get_customer_balance"] = test_get_customer_balance(customer_id)
        results["delete_customer"] = test_delete_customer(customer_id)
    
    # Test Vendors API
    print("\n📋 Testing Vendors API...")
    vendor_result, vendor_id = test_create_vendor()
    results["create_vendor"] = vendor_result
    
    results["get_vendors"] = test_get_vendors()
    
    if vendor_id:
        results["get_vendor_by_id"] = test_get_vendor_by_id(vendor_id)
        results["update_vendor"] = test_update_vendor(vendor_id)
        results["get_vendor_transactions"] = test_get_vendor_transactions(vendor_id)
        results["delete_vendor"] = test_delete_vendor(vendor_id)
    
    # Test Items API
    print("\n📋 Testing Items API...")
    item_result, item_id = test_create_item()
    results["create_item"] = item_result
    
    results["get_items"] = test_get_items()
    results["get_low_stock_items"] = test_get_low_stock_items()
    
    if item_id:
        results["get_item_by_id"] = test_get_item_by_id(item_id)
        results["update_item"] = test_update_item(item_id)
        results["delete_item"] = test_delete_item(item_id)
    
    # Test Employees API
    print("\n📋 Testing Employees API...")
    employee_result, employee_id = test_create_employee()
    results["create_employee"] = employee_result
    
    results["get_employees"] = test_get_employees()
    
    if employee_id:
        results["get_employee_by_id"] = test_get_employee_by_id(employee_id)
        results["update_employee"] = test_update_employee(employee_id)
        results["delete_employee"] = test_delete_employee(employee_id)
    
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
    success = run_list_management_tests()
    sys.exit(0 if success else 1)