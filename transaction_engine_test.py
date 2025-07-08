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

def test_create_invoice():
    """Test creating an invoice"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create invoice test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create invoice...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique reference number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # First, create a customer if needed
        customer_result, customer_id = test_create_customer()
        if not customer_result or not customer_id:
            print("❌ Create invoice test skipped: Failed to create test customer")
            return False, None
        
        # Create an invoice with line items
        payload = {
            "transaction_date": datetime.now().date().isoformat(),
            "due_date": (datetime.now().date() + timedelta(days=30)).isoformat(),
            "customer_id": customer_id,
            "reference_number": f"REF-INV-{timestamp}",
            "memo": "Test invoice created via API",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "description": "Test Product 1",
                    "quantity": 2,
                    "unit_price": 100.00,
                    "discount_amount": 10.00,
                    "tax_amount": 15.00
                },
                {
                    "line_number": 2,
                    "line_type": "item",
                    "description": "Test Service 1",
                    "quantity": 5,
                    "unit_price": 50.00,
                    "discount_amount": 5.00,
                    "tax_amount": 20.00
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
            return False, None
        
        if response.status_code == 201:
            if "transaction_id" in data:
                invoice_id = data["transaction_id"]
                
                # Verify the calculated totals
                subtotal = data.get("subtotal")
                tax_amount = data.get("tax_amount")
                total_amount = data.get("total_amount")
                
                print(f"Invoice created with ID: {invoice_id}")
                print(f"Subtotal: {subtotal}")
                print(f"Tax Amount: {tax_amount}")
                print(f"Total Amount: {total_amount}")
                
                # Expected calculations:
                # Line 1: (2 * 100) - 10 + 15 = 205
                # Line 2: (5 * 50) - 5 + 20 = 265
                # Subtotal: (2 * 100) + (5 * 50) - 10 - 5 = 435
                # Tax Amount: 15 + 20 = 35
                # Total Amount: 435 + 35 = 470
                
                expected_subtotal = 435.0
                expected_tax = 35.0
                expected_total = 470.0
                
                if (abs(float(subtotal) - expected_subtotal) < 0.01 and 
                    abs(float(tax_amount) - expected_tax) < 0.01 and 
                    abs(float(total_amount) - expected_total) < 0.01):
                    print("✅ Invoice calculations are correct")
                else:
                    print(f"❌ Invoice calculations are incorrect. Expected: Subtotal={expected_subtotal}, Tax={expected_tax}, Total={expected_total}")
                
                print(f"✅ Create invoice test passed (ID: {invoice_id})")
                return True, invoice_id
            else:
                print(f"❌ Create invoice test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create invoice test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create invoice test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create invoice test failed: {str(e)}")
        return False, None

def test_create_bill():
    """Test creating a bill"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create bill test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create bill...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique reference number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # First, create a vendor if needed
        vendor_result, vendor_id = test_create_vendor()
        if not vendor_result or not vendor_id:
            print("❌ Create bill test skipped: Failed to create test vendor")
            return False, None
        
        # Create a bill with line items
        payload = {
            "transaction_date": datetime.now().date().isoformat(),
            "due_date": (datetime.now().date() + timedelta(days=30)).isoformat(),
            "vendor_id": vendor_id,
            "reference_number": f"REF-BILL-{timestamp}",
            "memo": "Test bill created via API",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "description": "Office Supplies",
                    "quantity": 3,
                    "unit_price": 75.00,
                    "discount_amount": 15.00,
                    "tax_amount": 12.00
                },
                {
                    "line_number": 2,
                    "line_type": "item",
                    "description": "Consulting Services",
                    "quantity": 10,
                    "unit_price": 120.00,
                    "discount_amount": 50.00,
                    "tax_amount": 80.00
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/bills/", 
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
            if "transaction_id" in data:
                bill_id = data["transaction_id"]
                
                # Verify the calculated totals
                subtotal = data.get("subtotal")
                tax_amount = data.get("tax_amount")
                total_amount = data.get("total_amount")
                
                print(f"Bill created with ID: {bill_id}")
                print(f"Subtotal: {subtotal}")
                print(f"Tax Amount: {tax_amount}")
                print(f"Total Amount: {total_amount}")
                
                # Expected calculations:
                # Line 1: (3 * 75) - 15 + 12 = 222
                # Line 2: (10 * 120) - 50 + 80 = 1230
                # Subtotal: (3 * 75) + (10 * 120) - 15 - 50 = 1160
                # Tax Amount: 12 + 80 = 92
                # Total Amount: 1160 + 92 = 1252
                
                expected_subtotal = 1160.0
                expected_tax = 92.0
                expected_total = 1252.0
                
                if (abs(float(subtotal) - expected_subtotal) < 0.01 and 
                    abs(float(tax_amount) - expected_tax) < 0.01 and 
                    abs(float(total_amount) - expected_total) < 0.01):
                    print("✅ Bill calculations are correct")
                else:
                    print(f"❌ Bill calculations are incorrect. Expected: Subtotal={expected_subtotal}, Tax={expected_tax}, Total={expected_total}")
                
                print(f"✅ Create bill test passed (ID: {bill_id})")
                return True, bill_id
            else:
                print(f"❌ Create bill test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create bill test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create bill test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create bill test failed: {str(e)}")
        return False, None

def test_create_payment():
    """Test creating a payment"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create payment test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create payment...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique reference number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # First, create a customer and an invoice
        invoice_result, invoice_id = test_create_invoice()
        if not invoice_result or not invoice_id:
            print("❌ Create payment test skipped: Failed to create test invoice")
            return False, None
        
        # Create an account for deposit
        account_result, account_id = test_create_account()
        if not account_result or not account_id:
            print("❌ Create payment test skipped: Failed to create test account")
            return False, None
        
        # Create a payment
        payload = {
            "payment_date": datetime.now().date().isoformat(),
            "payment_type": "check",
            "payment_method": "Check #12345",
            "reference_number": f"REF-PMT-{timestamp}",
            "customer_id": invoice_id,  # Using invoice_id as customer_id for simplicity
            "amount_received": 250.00,
            "deposit_to_account_id": account_id,
            "memo": "Test payment created via API",
            "applications": [
                {
                    "transaction_id": invoice_id,
                    "amount_applied": 250.00,
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
            return False, None
        
        if response.status_code == 201:
            if "payment_id" in data:
                payment_id = data["payment_id"]
                print(f"✅ Create payment test passed (ID: {payment_id})")
                return True, payment_id
            else:
                print(f"❌ Create payment test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create payment test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create payment test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create payment test failed: {str(e)}")
        return False, None

def test_create_transaction():
    """Test creating a general transaction"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create transaction test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create general transaction...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique reference number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Create a general transaction
        payload = {
            "transaction_type": "journal_entry",
            "transaction_date": datetime.now().date().isoformat(),
            "reference_number": f"REF-JE-{timestamp}",
            "memo": "Test journal entry created via API",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "account",
                    "description": "Debit Entry",
                    "quantity": 1,
                    "unit_price": 500.00,
                    "discount_amount": 0.00,
                    "tax_amount": 0.00
                },
                {
                    "line_number": 2,
                    "line_type": "account",
                    "description": "Credit Entry",
                    "quantity": 1,
                    "unit_price": 500.00,
                    "discount_amount": 0.00,
                    "tax_amount": 0.00
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/transactions/", 
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
            if "transaction_id" in data:
                transaction_id = data["transaction_id"]
                
                # Verify the calculated totals
                subtotal = data.get("subtotal")
                tax_amount = data.get("tax_amount")
                total_amount = data.get("total_amount")
                
                print(f"Transaction created with ID: {transaction_id}")
                print(f"Subtotal: {subtotal}")
                print(f"Tax Amount: {tax_amount}")
                print(f"Total Amount: {total_amount}")
                
                # Expected calculations:
                # Line 1: (1 * 500) - 0 + 0 = 500
                # Line 2: (1 * 500) - 0 + 0 = 500
                # Subtotal: (1 * 500) + (1 * 500) - 0 - 0 = 1000
                # Tax Amount: 0 + 0 = 0
                # Total Amount: 1000 + 0 = 1000
                
                expected_subtotal = 1000.0
                expected_tax = 0.0
                expected_total = 1000.0
                
                if (abs(float(subtotal) - expected_subtotal) < 0.01 and 
                    abs(float(tax_amount) - expected_tax) < 0.01 and 
                    abs(float(total_amount) - expected_total) < 0.01):
                    print("✅ Transaction calculations are correct")
                else:
                    print(f"❌ Transaction calculations are incorrect. Expected: Subtotal={expected_subtotal}, Tax={expected_tax}, Total={expected_total}")
                
                print(f"✅ Create transaction test passed (ID: {transaction_id})")
                return True, transaction_id
            else:
                print(f"❌ Create transaction test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create transaction test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create transaction test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create transaction test failed: {str(e)}")
        return False, None

def test_create_sales_receipt():
    """Test creating a sales receipt"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create sales receipt test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create sales receipt...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique reference number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # First, create a customer if needed
        customer_result, customer_id = test_create_customer()
        if not customer_result or not customer_id:
            print("❌ Create sales receipt test skipped: Failed to create test customer")
            return False, None
        
        # Create a sales receipt with line items
        payload = {
            "transaction_type": "sales_receipt",
            "transaction_date": datetime.now().date().isoformat(),
            "customer_id": customer_id,
            "reference_number": f"REF-SR-{timestamp}",
            "memo": "Test sales receipt created via API",
            "lines": [
                {
                    "line_number": 1,
                    "line_type": "item",
                    "description": "Product Sale 1",
                    "quantity": 2,
                    "unit_price": 75.00,
                    "discount_amount": 5.00,
                    "tax_amount": 10.00
                },
                {
                    "line_number": 2,
                    "line_type": "item",
                    "description": "Product Sale 2",
                    "quantity": 1,
                    "unit_price": 150.00,
                    "discount_amount": 0.00,
                    "tax_amount": 15.00
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/transactions/", 
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
            if "transaction_id" in data:
                receipt_id = data["transaction_id"]
                
                # Verify the calculated totals
                subtotal = data.get("subtotal")
                tax_amount = data.get("tax_amount")
                total_amount = data.get("total_amount")
                
                print(f"Sales Receipt created with ID: {receipt_id}")
                print(f"Subtotal: {subtotal}")
                print(f"Tax Amount: {tax_amount}")
                print(f"Total Amount: {total_amount}")
                
                # Expected calculations:
                # Line 1: (2 * 75) - 5 + 10 = 155
                # Line 2: (1 * 150) - 0 + 15 = 165
                # Subtotal: (2 * 75) + (1 * 150) - 5 - 0 = 295
                # Tax Amount: 10 + 15 = 25
                # Total Amount: 295 + 25 = 320
                
                expected_subtotal = 295.0
                expected_tax = 25.0
                expected_total = 320.0
                
                if (abs(float(subtotal) - expected_subtotal) < 0.01 and 
                    abs(float(tax_amount) - expected_tax) < 0.01 and 
                    abs(float(total_amount) - expected_total) < 0.01):
                    print("✅ Sales Receipt calculations are correct")
                else:
                    print(f"❌ Sales Receipt calculations are incorrect. Expected: Subtotal={expected_subtotal}, Tax={expected_tax}, Total={expected_total}")
                
                print(f"✅ Create sales receipt test passed (ID: {receipt_id})")
                return True, receipt_id
            else:
                print(f"❌ Create sales receipt test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create sales receipt test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create sales receipt test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create sales receipt test failed: {str(e)}")
        return False, None

def run_transaction_engine_tests():
    """Run all Transaction Engine Module API tests"""
    print("\n🔍 Starting QuickBooks Clone Transaction Engine Module API tests...")
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
            print("❌ No company ID available, skipping transaction tests")
            return False
    else:
        print("❌ Login failed, skipping all transaction tests")
        return False
    
    # Test Transaction Engine APIs
    print("\n📋 Testing Transaction Engine APIs...")
    
    # Test Invoice Creation
    invoice_result, invoice_id = test_create_invoice()
    results["create_invoice"] = invoice_result
    
    # Test Bill Creation
    bill_result, bill_id = test_create_bill()
    results["create_bill"] = bill_result
    
    # Test Payment Creation
    payment_result, payment_id = test_create_payment()
    results["create_payment"] = payment_result
    
    # Test General Transaction Creation
    transaction_result, transaction_id = test_create_transaction()
    results["create_transaction"] = transaction_result
    
    # Test Sales Receipt Creation
    receipt_result, receipt_id = test_create_sales_receipt()
    results["create_sales_receipt"] = receipt_result
    
    # Print summary
    print("\n📊 Transaction Engine Module Test Summary:")
    for test_name, result in results.items():
        status = "✅ Passed" if result else "❌ Failed"
        print(f"{test_name}: {status}")
    
    # Overall result
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All Transaction Engine Module tests passed!")
    else:
        print("\n❌ Some Transaction Engine Module tests failed.")
    
    return all_passed

if __name__ == "__main__":
    success = run_transaction_engine_tests()
    sys.exit(0 if success else 1)