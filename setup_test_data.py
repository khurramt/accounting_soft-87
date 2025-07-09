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
    
    # Create revenue account
    revenue_payload = {
        "account_name": "Test Revenue Account",
        "account_type": "revenue",
        "account_number": "4000",
        "description": "Test revenue account for API testing",
        "is_active": True
    }
    
    revenue_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=revenue_payload, 
        timeout=TIMEOUT
    )
    
    revenue_account_id = None
    if revenue_response.status_code == 201:
        revenue_data = revenue_response.json()
        revenue_account_id = revenue_data["account_id"]
        print(f"✅ Created revenue account with ID: {revenue_account_id}")
    else:
        print(f"❌ Failed to create revenue account: Status code {revenue_response.status_code}")
        try:
            print(f"Response: {revenue_response.json()}")
        except:
            print(f"Response: {revenue_response.text}")
    
    # Create expenses account
    expenses_payload = {
        "account_name": "Test Expenses Account",
        "account_type": "expenses",
        "account_number": "5000",
        "description": "Test expenses account for API testing",
        "is_active": True
    }
    
    expenses_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=expenses_payload, 
        timeout=TIMEOUT
    )
    
    expenses_account_id = None
    if expenses_response.status_code == 201:
        expenses_data = expenses_response.json()
        expenses_account_id = expenses_data["account_id"]
        print(f"✅ Created expenses account with ID: {expenses_account_id}")
    else:
        print(f"❌ Failed to create expenses account: Status code {expenses_response.status_code}")
        try:
            print(f"Response: {expenses_response.json()}")
        except:
            print(f"Response: {expenses_response.text}")
    
    # Create assets account
    assets_payload = {
        "account_name": "Test Assets Account",
        "account_type": "assets",
        "account_number": "1000",
        "description": "Test assets account for API testing",
        "is_active": True
    }
    
    assets_response = requests.post(
        f"{API_URL}/companies/{COMPANY_ID}/accounts/", 
        headers=headers, 
        json=assets_payload, 
        timeout=TIMEOUT
    )
    
    assets_account_id = None
    if assets_response.status_code == 201:
        assets_data = assets_response.json()
        assets_account_id = assets_data["account_id"]
        print(f"✅ Created assets account with ID: {assets_account_id}")
    else:
        print(f"❌ Failed to create assets account: Status code {assets_response.status_code}")
        try:
            print(f"Response: {assets_response.json()}")
        except:
            print(f"Response: {assets_response.text}")
    
    return revenue_account_id, expenses_account_id, assets_account_id

def save_test_data(customer_id, vendor_id, revenue_account_id, expenses_account_id, assets_account_id):
    """Save test data to a file for use in backend_test.py"""
    test_data = {
        "customer_id": customer_id,
        "vendor_id": vendor_id,
        "revenue_account_id": revenue_account_id,
        "expenses_account_id": expenses_account_id,
        "assets_account_id": assets_account_id
    }
    
    with open('/app/test_data.json', 'w') as f:
        json.dump(test_data, f)
    
    print(f"\n✅ Saved test data to /app/test_data.json")

if __name__ == "__main__":
    print("\n🔍 Setting up test data for QuickBooks Clone API tests...")
    
    if login() and get_company_id():
        customer_id = create_customer()
        vendor_id = create_vendor()
        revenue_account_id, expenses_account_id, assets_account_id = create_accounts()
        
        if customer_id and vendor_id and revenue_account_id and expenses_account_id and assets_account_id:
            save_test_data(customer_id, vendor_id, revenue_account_id, expenses_account_id, assets_account_id)
            print("\n✅ Test data setup completed successfully.")
        else:
            print("\n❌ Test data setup failed. Some entities could not be created.")
    else:
        print("\n❌ Test data setup failed. Could not authenticate or get company ID.")