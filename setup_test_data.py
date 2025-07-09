#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
import decimal
import uuid

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

def login():
    """Login with demo user"""
    global ACCESS_TOKEN, REFRESH_TOKEN, USER_ID
    
    print("\n🔍 Logging in with demo user...")
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
    
    if response.status_code == 200:
        data = response.json()
        ACCESS_TOKEN = data["access_token"]
        REFRESH_TOKEN = data["refresh_token"]
        USER_ID = data["user"]["user_id"]
        print("✅ Login successful")
        return True
    else:
        print(f"❌ Login failed: Status code {response.status_code}")
        return False

def get_company_id():
    """Get company ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    print("\n🔍 Getting company ID...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            COMPANY_ID = data[0]["company"]["company_id"]
            print(f"✅ Got company ID: {COMPANY_ID}")
            return True
        else:
            print("❌ No companies found")
            return False
    else:
        print(f"❌ Failed to get companies: Status code {response.status_code}")
        return False

def create_customer():
    """Create a test customer"""
    global ACCESS_TOKEN, COMPANY_ID
    
    print("\n🔍 Creating test customer...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Generate a unique customer
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    payload = {
        "customer_name": f"Test Customer {timestamp}",
        "company_name": "Test Customer Inc.",
        "customer_type": "business",
        "contact_person": "John Doe",
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
    
    if response.status_code == 201:
        data = response.json()
        customer_id = data["customer_id"]
        print(f"✅ Created customer with ID: {customer_id}")
        return customer_id
    else:
        print(f"❌ Failed to create customer: Status code {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response: {response.text}")
        return None

def create_vendor():
    """Create a test vendor"""
    global ACCESS_TOKEN, COMPANY_ID
    
    print("\n🔍 Creating test vendor...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Generate a unique vendor
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
    
    if response.status_code == 201:
        data = response.json()
        vendor_id = data["vendor_id"]
        print(f"✅ Created vendor with ID: {vendor_id}")
        return vendor_id
    else:
        print(f"❌ Failed to create vendor: Status code {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response: {response.text}")
        return None

def create_accounts():
    """Create test accounts"""
    global ACCESS_TOKEN, COMPANY_ID
    
    print("\n🔍 Creating test accounts...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Create income account
    income_payload = {
        "account_name": "Test Income Account",
        "account_type": "income",
        "account_number": "4000",
        "description": "Test income account for API testing",
        "is_active": True
    }
    
    income_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=income_payload, 
        timeout=TIMEOUT
    )
    
    income_account_id = None
    if income_response.status_code == 201:
        income_data = income_response.json()
        income_account_id = income_data["account_id"]
        print(f"✅ Created income account with ID: {income_account_id}")
    else:
        print(f"❌ Failed to create income account: Status code {income_response.status_code}")
        try:
            print(f"Response: {income_response.json()}")
        except:
            print(f"Response: {income_response.text}")
    
    # Create expense account
    expense_payload = {
        "account_name": "Test Expense Account",
        "account_type": "expense",
        "account_number": "5000",
        "description": "Test expense account for API testing",
        "is_active": True
    }
    
    expense_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=expense_payload, 
        timeout=TIMEOUT
    )
    
    expense_account_id = None
    if expense_response.status_code == 201:
        expense_data = expense_response.json()
        expense_account_id = expense_data["account_id"]
        print(f"✅ Created expense account with ID: {expense_account_id}")
    else:
        print(f"❌ Failed to create expense account: Status code {expense_response.status_code}")
        try:
            print(f"Response: {expense_response.json()}")
        except:
            print(f"Response: {expense_response.text}")
    
    # Create bank account
    bank_payload = {
        "account_name": "Test Bank Account",
        "account_type": "bank",
        "account_number": "1000",
        "description": "Test bank account for API testing",
        "is_active": True
    }
    
    bank_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=bank_payload, 
        timeout=TIMEOUT
    )
    
    bank_account_id = None
    if bank_response.status_code == 201:
        bank_data = bank_response.json()
        bank_account_id = bank_data["account_id"]
        print(f"✅ Created bank account with ID: {bank_account_id}")
    else:
        print(f"❌ Failed to create bank account: Status code {bank_response.status_code}")
        try:
            print(f"Response: {bank_response.json()}")
        except:
            print(f"Response: {bank_response.text}")
    
    return income_account_id, expense_account_id, bank_account_id

def save_test_data(customer_id, vendor_id, income_account_id, expense_account_id, bank_account_id):
    """Save test data to a file for use in backend_test.py"""
    test_data = {
        "customer_id": customer_id,
        "vendor_id": vendor_id,
        "income_account_id": income_account_id,
        "expense_account_id": expense_account_id,
        "bank_account_id": bank_account_id
    }
    
    with open('/app/test_data.json', 'w') as f:
        json.dump(test_data, f)
    
    print(f"\n✅ Saved test data to /app/test_data.json")

if __name__ == "__main__":
    print("\n🔍 Setting up test data for QuickBooks Clone API tests...")
    
    if login() and get_company_id():
        customer_id = create_customer()
        vendor_id = create_vendor()
        income_account_id, expense_account_id, bank_account_id = create_accounts()
        
        if customer_id and vendor_id and income_account_id and expense_account_id and bank_account_id:
            save_test_data(customer_id, vendor_id, income_account_id, expense_account_id, bank_account_id)
            print("\n✅ Test data setup completed successfully.")
        else:
            print("\n❌ Test data setup failed. Some entities could not be created.")
    else:
        print("\n❌ Test data setup failed. Could not authenticate or get company ID.")