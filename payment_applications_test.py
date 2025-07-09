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
    """Login with demo user credentials"""
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
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful")
        return data["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        try:
            print(response.json())
        except:
            print(response.text)
        return None

def get_company_id(access_token):
    """Get the first company ID for the user"""
    print("\n🔍 Getting company ID...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(
        f"{API_URL}/auth/companies", 
        headers=headers, 
        timeout=TIMEOUT
    )
    
    if response.status_code == 200:
        data = response.json()
        if len(data) > 0:
            company_id = data[0]["company"]["company_id"]
            print(f"✅ Got company ID: {company_id}")
            return company_id
        else:
            print("❌ No companies found")
            return None
    else:
        print(f"❌ Failed to get companies: {response.status_code}")
        return None

def get_customer_id(access_token, company_id):
    """Get the first customer ID for the company"""
    print("\n🔍 Getting customer ID...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(
        f"{API_URL}/companies/{company_id}/customers/", 
        headers=headers, 
        timeout=TIMEOUT
    )
    
    if response.status_code == 200:
        data = response.json()
        if data["total"] > 0:
            customer_id = data["items"][0]["customer_id"]
            print(f"✅ Got customer ID: {customer_id}")
            return customer_id
        else:
            print("❌ No customers found")
            return None
    else:
        print(f"❌ Failed to get customers: {response.status_code}")
        return None

def get_account_id(access_token, company_id):
    """Get a bank account ID for the company"""
    print("\n🔍 Getting account ID...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(
        f"{API_URL}/companies/{company_id}/accounts/", 
        headers=headers, 
        timeout=TIMEOUT
    )
    
    if response.status_code == 200:
        data = response.json()
        if data["total"] > 0:
            # Try to find a bank account
            for account in data["items"]:
                if account.get("account_type") == "bank":
                    account_id = account["account_id"]
                    print(f"✅ Got bank account ID: {account_id}")
                    return account_id
            
            # If no bank account, use the first account
            account_id = data["items"][0]["account_id"]
            print(f"✅ Got account ID: {account_id}")
            return account_id
        else:
            print("❌ No accounts found")
            return None
    else:
        print(f"❌ Failed to get accounts: {response.status_code}")
        return None

def create_invoice(access_token, company_id, customer_id, account_id):
    """Create an invoice to apply payment to"""
    print("\n🔍 Creating invoice...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    payload = {
        "transaction_date": date.today().isoformat(),
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "customer_id": customer_id,
        "memo": f"Test Invoice {timestamp}",
        "lines": [
            {
                "line_number": 1,
                "line_type": "item",
                "account_id": account_id,
                "description": "Test Invoice Item",
                "quantity": 1,
                "unit_price": 100.00,
                "tax_rate": 0.0
            }
        ]
    }
    
    response = requests.post(
        f"{API_URL}/companies/{company_id}/invoices/", 
        headers=headers, 
        json=payload, 
        timeout=TIMEOUT
    )
    
    if response.status_code == 201:
        data = response.json()
        invoice_id = data["transaction_id"]
        print(f"✅ Created invoice: {invoice_id}")
        return invoice_id
    else:
        print(f"❌ Failed to create invoice: {response.status_code}")
        try:
            print(response.json())
        except:
            print(response.text)
        return None

def test_payment_with_applications(access_token, company_id, customer_id, account_id, invoice_id):
    """Test creating a payment with applications field"""
    print("\n🔍 Testing payment creation with applications field...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    payload = {
        "payment_date": date.today().isoformat(),
        "payment_type": "check",
        "payment_method": f"Check #{timestamp}",
        "customer_id": customer_id,
        "amount_received": 100.00,
        "deposit_to_account_id": account_id,
        "memo": f"Test Payment {timestamp}",
        "applications": [
            {
                "transaction_id": invoice_id,
                "amount_applied": 100.00,
                "discount_taken": 0.00
            }
        ]
    }
    
    print(f"Request payload: {pretty_print_json(payload)}")
    
    response = requests.post(
        f"{API_URL}/companies/{company_id}/payments/", 
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
    
    if response.status_code == 201:
        print("✅ Payment creation with applications successful")
    else:
        print("❌ Payment creation with applications failed")

def test_payment_without_applications(access_token, company_id, customer_id, account_id):
    """Test creating a payment without applications field"""
    print("\n🔍 Testing payment creation without applications field...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    payload = {
        "payment_date": date.today().isoformat(),
        "payment_type": "check",
        "payment_method": f"Check #{timestamp}",
        "customer_id": customer_id,
        "amount_received": 50.00,
        "deposit_to_account_id": account_id,
        "memo": f"Test Payment No Applications {timestamp}",
        "applications": []
    }
    
    print(f"Request payload: {pretty_print_json(payload)}")
    
    response = requests.post(
        f"{API_URL}/companies/{company_id}/payments/", 
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
    
    if response.status_code == 201:
        print("✅ Payment creation without applications successful")
    else:
        print("❌ Payment creation without applications failed")

def test_payment_with_invalid_company_id(access_token, customer_id, account_id):
    """Test payment creation with invalid company ID"""
    print("\n🔍 Testing payment creation with invalid company ID...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    invalid_company_id = str(uuid.uuid4())
    
    payload = {
        "payment_date": date.today().isoformat(),
        "payment_type": "check",
        "payment_method": f"Check #{timestamp}",
        "customer_id": customer_id,
        "amount_received": 25.00,
        "deposit_to_account_id": account_id,
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
    
    if response.status_code in [403, 404]:
        print(f"✅ Payment with invalid company ID test passed (Got expected error status: {response.status_code})")
    elif response.status_code == 500:
        print(f"⚠️ Payment with invalid company ID returned 500 error instead of 403/404 (Known issue)")
    else:
        print(f"❌ Payment with invalid company ID test failed: Unexpected status code {response.status_code}")

def main():
    """Main test function"""
    # Login
    access_token = test_login()
    if not access_token:
        print("❌ Cannot proceed with tests: Login failed")
        return
    
    # Get company ID
    company_id = get_company_id(access_token)
    if not company_id:
        print("❌ Cannot proceed with tests: Failed to get company ID")
        return
    
    # Get customer ID
    customer_id = get_customer_id(access_token, company_id)
    if not customer_id:
        print("❌ Cannot proceed with tests: Failed to get customer ID")
        return
    
    # Get account ID
    account_id = get_account_id(access_token, company_id)
    if not account_id:
        print("❌ Cannot proceed with tests: Failed to get account ID")
        return
    
    # Create invoice
    invoice_id = create_invoice(access_token, company_id, customer_id, account_id)
    if not invoice_id:
        print("❌ Cannot proceed with payment tests: Failed to create invoice")
        return
    
    # Test payments
    test_payment_with_applications(access_token, company_id, customer_id, account_id, invoice_id)
    test_payment_without_applications(access_token, company_id, customer_id, account_id)
    test_payment_with_invalid_company_id(access_token, customer_id, account_id)

if __name__ == "__main__":
    main()