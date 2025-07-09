#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
import decimal
from typing import Dict, Any, Optional, Tuple, List
import uuid

# Disable SSL warnings
import urllib3
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
CUSTOMER_ID = None
ACCOUNT_ID = None
INVOICE_ID = None

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
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
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
    except requests.exceptions.Timeout:
        print(f"❌ Get customers test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get customers test failed: {str(e)}")
        return False

def test_get_accounts():
    """Test getting accounts"""
    global ACCESS_TOKEN, COMPANY_ID, ACCOUNT_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get accounts test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get accounts...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
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
            if "items" in data and "total" in data:
                if data["total"] > 0:
                    # Find a bank account for testing
                    for account in data["items"]:
                        if account.get("account_type") == "bank":
                            ACCOUNT_ID = account["account_id"]
                            print(f"Using bank account ID: {ACCOUNT_ID}")
                            break
                    
                    # If no bank account, use the first account
                    if not ACCOUNT_ID:
                        ACCOUNT_ID = data["items"][0]["account_id"]
                        print(f"Using account ID: {ACCOUNT_ID}")
                        
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

def test_create_invoice():
    """Test creating an invoice"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID, ACCOUNT_ID, INVOICE_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID or not ACCOUNT_ID:
        print("❌ Create invoice test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing create invoice...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique invoice
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "transaction_date": date.today().isoformat(),
            "due_date": (date.today() + timedelta(days=30)).isoformat(),
            "customer_id": CUSTOMER_ID,
            "memo": f"Test Invoice {timestamp}",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "account_id": ACCOUNT_ID,
                    "description": "Test Invoice Item 1",
                    "quantity": 2,
                    "unit_price": 100.00,
                    "tax_rate": 0.0
                },
                {
                    "line_number": 2,
                    "line_type": "item",
                    "account_id": ACCOUNT_ID,
                    "description": "Test Invoice Item 2",
                    "quantity": 1,
                    "unit_price": 50.00,
                    "tax_rate": 0.0
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/invoices/", 
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
        
        if response.status_code == 201:
            if "transaction_id" in data:
                INVOICE_ID = data["transaction_id"]
                print(f"✅ Create invoice test passed (ID: {INVOICE_ID})")
                return True
            else:
                print(f"❌ Create invoice test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create invoice test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Create invoice test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Create invoice test failed: {str(e)}")
        return False

def test_create_payment_with_applications():
    """Test creating a payment with applications field"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID, ACCOUNT_ID, INVOICE_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID or not ACCOUNT_ID or not INVOICE_ID:
        print("❌ Create payment with applications test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing create payment with applications field...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique payment
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Payment payload with applications field
        payload = {
            "payment_date": date.today().isoformat(),
            "payment_type": "check",
            "payment_method": "Check #12345",
            "customer_id": CUSTOMER_ID,
            "amount_received": 100.00,
            "deposit_to_account_id": ACCOUNT_ID,
            "memo": f"Test Payment {timestamp}",
            "applications": [
                {
                    "transaction_id": INVOICE_ID,
                    "amount_applied": 100.00,
                    "discount_taken": 0.0
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payments/", 
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
        
        if response.status_code == 201:
            if "payment_id" in data:
                print(f"✅ Create payment with applications test passed (ID: {data['payment_id']})")
                return True
            else:
                print(f"❌ Create payment with applications test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create payment with applications test failed: Status code {response.status_code}")
            print(f"Error message: {data.get('detail', 'No error details')}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Create payment with applications test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Create payment with applications test failed: {str(e)}")
        return False

def test_create_payment_without_applications():
    """Test creating a payment without applications field"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID, ACCOUNT_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID or not ACCOUNT_ID:
        print("❌ Create payment without applications test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing create payment without applications field...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique payment
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Payment payload without applications field
        payload = {
            "payment_date": date.today().isoformat(),
            "payment_type": "check",
            "payment_method": "Check #54321",
            "customer_id": CUSTOMER_ID,
            "amount_received": 50.00,
            "deposit_to_account_id": ACCOUNT_ID,
            "memo": f"Test Payment No Applications {timestamp}",
            "applications": []  # Empty applications array
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payments/", 
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
        
        if response.status_code == 201:
            if "payment_id" in data:
                print(f"✅ Create payment without applications test passed (ID: {data['payment_id']})")
                return True
            else:
                print(f"❌ Create payment without applications test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create payment without applications test failed: Status code {response.status_code}")
            print(f"Error message: {data.get('detail', 'No error details')}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Create payment without applications test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Create payment without applications test failed: {str(e)}")
        return False

def test_payment_with_invalid_company_id():
    """Test payment creation with invalid company ID"""
    global ACCESS_TOKEN, CUSTOMER_ID, ACCOUNT_ID
    
    if not ACCESS_TOKEN or not CUSTOMER_ID or not ACCOUNT_ID:
        print("❌ Payment with invalid company ID test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing payment creation with invalid company ID...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique payment
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Invalid company ID (random UUID)
        invalid_company_id = str(uuid.uuid4())
        
        # Payment payload
        payload = {
            "payment_date": date.today().isoformat(),
            "payment_type": "check",
            "payment_method": "Check #99999",
            "customer_id": CUSTOMER_ID,
            "amount_received": 25.00,
            "deposit_to_account_id": ACCOUNT_ID,
            "memo": f"Test Payment Invalid Company {timestamp}",
            "applications": []
        }
        
        response = requests.post(
            f"{API_URL}/companies/{invalid_company_id}/payments/", 
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
        
        # We expect a 403 Forbidden or 404 Not Found for invalid company ID
        if response.status_code in [403, 404]:
            print(f"✅ Payment with invalid company ID test passed (Got expected error status: {response.status_code})")
            return True
        elif response.status_code == 500:
            print(f"⚠️ Payment with invalid company ID returned 500 error instead of 403/404 (Known issue)")
            return False
        else:
            print(f"❌ Payment with invalid company ID test failed: Unexpected status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Payment with invalid company ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Payment with invalid company ID test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    # Setup tests
    if not test_login_demo_user():
        print("❌ Login failed, cannot proceed with tests")
        return
    
    if not test_get_user_companies():
        print("❌ Failed to get companies, cannot proceed with tests")
        return
    
    if not test_company_access():
        print("❌ Failed to get company access, cannot proceed with tests")
        return
    
    if not test_get_customers():
        print("❌ Failed to get customers, cannot proceed with tests")
        return
    
    if not test_get_accounts():
        print("❌ Failed to get accounts, cannot proceed with tests")
        return
    
    if not test_create_invoice():
        print("❌ Failed to create invoice, cannot proceed with payment tests")
        return
    
    # Payment tests
    test_create_payment_with_applications()
    test_create_payment_without_applications()
    test_payment_with_invalid_company_id()

if __name__ == "__main__":
    main()