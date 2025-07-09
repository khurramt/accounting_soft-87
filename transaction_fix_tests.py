#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
import decimal
from typing import Dict, Any, Optional, Tuple, List
import io
import urllib3
import uuid

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
CUSTOMER_ID = None
VENDOR_ID = None
ACCOUNT_ID = None
INVOICE_ID = None
BILL_ID = None
PAYMENT_ID = None

# Custom JSON encoder to handle decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def pretty_print_json(data):
    """Print JSON data with proper formatting and decimal handling"""
    return json.dumps(data, indent=2, cls=DecimalEncoder)

def test_login():
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
                print("✅ Login successful")
                return True
            else:
                print(f"❌ Login failed: Unexpected response")
                return False
        else:
            print(f"❌ Login failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login failed: {str(e)}")
        return False

def test_get_company():
    """Get company ID for testing"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get company test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Getting company ID for testing...")
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
            if isinstance(data, list) and len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"Using company ID: {COMPANY_ID}")
                return True
            else:
                print(f"❌ No companies found")
                return False
        else:
            print(f"❌ Failed to get companies: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to get companies: {str(e)}")
        return False

def test_get_customer():
    """Get customer ID for testing"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get customer test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Getting customer ID for testing...")
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
            if "items" in data and len(data["items"]) > 0:
                CUSTOMER_ID = data["items"][0]["customer_id"]
                print(f"Using customer ID: {CUSTOMER_ID}")
                return True
            else:
                print(f"❌ No customers found")
                return False
        else:
            print(f"❌ Failed to get customers: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to get customers: {str(e)}")
        return False

def test_get_account():
    """Get account ID for testing"""
    global ACCESS_TOKEN, COMPANY_ID, ACCOUNT_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get account test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Getting account ID for testing...")
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
            if "items" in data and len(data["items"]) > 0:
                # Find an income account if possible
                for account in data["items"]:
                    if account.get("account_type") == "income":
                        ACCOUNT_ID = account["account_id"]
                        print(f"Using income account ID: {ACCOUNT_ID}")
                        return True
                
                # Otherwise use the first account
                ACCOUNT_ID = data["items"][0]["account_id"]
                print(f"Using account ID: {ACCOUNT_ID}")
                return True
            else:
                print(f"❌ No accounts found")
                return False
        else:
            print(f"❌ Failed to get accounts: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to get accounts: {str(e)}")
        return False

def test_create_invoice():
    """Create an invoice for testing"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID, ACCOUNT_ID, INVOICE_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID or not ACCOUNT_ID:
        print("❌ Create invoice test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Creating an invoice for testing...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "transaction_date": date.today().isoformat(),
            "due_date": (date.today() + timedelta(days=30)).isoformat(),
            "customer_id": CUSTOMER_ID,
            "memo": f"Test Invoice {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "account_id": ACCOUNT_ID,
                    "description": "Test Item",
                    "quantity": 1,
                    "unit_price": 100.00,
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
                print(f"Created invoice with ID: {INVOICE_ID}")
                return True
            else:
                print(f"❌ Failed to create invoice: Unexpected response")
                return False
        else:
            print(f"❌ Failed to create invoice: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to create invoice: {str(e)}")
        return False

def test_update_invoice():
    """Test updating an invoice (tests the fix for update operations)"""
    global ACCESS_TOKEN, COMPANY_ID, INVOICE_ID, ACCOUNT_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not INVOICE_ID or not ACCOUNT_ID:
        print("❌ Update invoice test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing update invoice operation (Fix #2)...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "memo": f"Updated Invoice {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "account_id": ACCOUNT_ID,
                    "description": "Updated Test Item",
                    "quantity": 2,
                    "unit_price": 150.00,
                    "tax_rate": 0.0
                }
            ]
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/invoices/{INVOICE_ID}", 
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
            print("✅ Update invoice operation successful")
            return True
        else:
            print(f"❌ Update invoice operation failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Update invoice operation failed: {str(e)}")
        return False

def test_create_payment_with_applications():
    """Test creating a payment with applications (tests the fix for payment creation)"""
    global ACCESS_TOKEN, COMPANY_ID, CUSTOMER_ID, ACCOUNT_ID, INVOICE_ID, PAYMENT_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not CUSTOMER_ID or not ACCOUNT_ID or not INVOICE_ID:
        print("❌ Create payment test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing payment creation with applications (Fix #3)...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "payment_date": date.today().isoformat(),
            "payment_type": "check",
            "payment_method": "Check #12345",
            "customer_id": CUSTOMER_ID,
            "amount_received": 100.00,
            "deposit_to_account_id": ACCOUNT_ID,
            "memo": f"Test Payment {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "applications": [
                {
                    "transaction_id": INVOICE_ID,
                    "amount_applied": 100.00,
                    "discount_taken": 0.00
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
                PAYMENT_ID = data["payment_id"]
                print("✅ Payment creation with applications successful")
                return True
            else:
                print(f"❌ Payment creation with applications failed: Unexpected response")
                return False
        else:
            print(f"❌ Payment creation with applications failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Payment creation with applications failed: {str(e)}")
        return False

def test_invalid_company_id_error_handling():
    """Test error handling for invalid company ID (tests the fix for error handling)"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Invalid company ID error handling test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing error handling for invalid company ID (Fix #4)...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Use a non-existent UUID as invalid company ID
        invalid_company_id = str(uuid.uuid4())
        
        response = requests.get(
            f"{API_URL}/companies/{invalid_company_id}/transactions/", 
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
        
        # Check if the response is 403 or 404 (not 500)
        if response.status_code in [403, 404]:
            print("✅ Error handling for invalid company ID successful")
            return True
        else:
            print(f"❌ Error handling for invalid company ID failed: Expected status code 403 or 404, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error handling for invalid company ID failed: {str(e)}")
        return False

def test_status_parameter_conflict():
    """Test that API endpoints no longer return AttributeError for status object (Fix #1)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Status parameter conflict test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing status parameter conflict fix (Fix #1)...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with status parameter
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/transactions/?transaction_status=draft", 
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
            print("✅ Status parameter conflict fix successful")
            return True
        else:
            print(f"❌ Status parameter conflict fix failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Status parameter conflict fix failed: {str(e)}")
        return False

def run_tests():
    """Run all tests for Transaction Management API fixes"""
    print("🚀 Starting Transaction Management API Fix Tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Setup - Authentication and getting required IDs
    if not test_login():
        print("❌ Authentication failed, aborting tests")
        return
    
    if not test_get_company():
        print("❌ Failed to get company ID, aborting tests")
        return
    
    if not test_get_customer():
        print("❌ Failed to get customer ID, aborting tests")
        return
    
    if not test_get_account():
        print("❌ Failed to get account ID, aborting tests")
        return
    
    if not test_create_invoice():
        print("❌ Failed to create invoice, aborting tests")
        return
    
    # Test Fix #1: Status Parameter Conflict Fix
    test_status_parameter_conflict()
    
    # Test Fix #2: Update Operations Fix
    test_update_invoice()
    
    # Test Fix #3: Payment Creation Fix
    test_create_payment_with_applications()
    
    # Test Fix #4: Error Handling Fix
    test_invalid_company_id_error_handling()
    
    print("\n✅ Transaction Management API Fix Tests completed")

if __name__ == "__main__":
    run_tests()