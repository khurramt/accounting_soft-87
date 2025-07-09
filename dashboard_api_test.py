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

# ===== DASHBOARD API TESTS =====

def test_dashboard_api():
    """Test the dashboard API with different date ranges"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Dashboard API test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing dashboard API with different date ranges...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with various date ranges
        date_ranges = [
            "today",
            "this-week",
            "this-month",
            "this-quarter",
            "this-year"
        ]
        
        for date_range in date_ranges:
            print(f"\n  Testing dashboard API with date range: {date_range}...")
            
            response = requests.get(
                f"{API_URL}/companies/{COMPANY_ID}/reports/dashboard", 
                headers=headers, 
                params={"date_range": date_range},
                timeout=TIMEOUT
            )
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  Response structure: {list(data.keys())}")
                
                # Verify the response structure
                expected_keys = ["date_range", "start_date", "end_date", "stats", "recent_transactions", "accounts_receivable"]
                missing_keys = [key for key in expected_keys if key not in data]
                
                if missing_keys:
                    print(f"  ❌ Missing keys in response: {missing_keys}")
                    return False
                
                # Verify stats structure
                expected_stats = ["total_income", "total_expenses", "net_income", "outstanding_invoices"]
                missing_stats = [stat for stat in expected_stats if stat not in data["stats"]]
                
                if missing_stats:
                    print(f"  ❌ Missing stats in response: {missing_stats}")
                    return False
                
                # Verify accounts receivable structure
                expected_ar = ["current", "days_31_60", "days_61_90", "over_90_days"]
                missing_ar = [ar for ar in expected_ar if ar not in data["accounts_receivable"]]
                
                if missing_ar:
                    print(f"  ❌ Missing accounts receivable data in response: {missing_ar}")
                    return False
                
                print(f"  ✅ Dashboard API test with date range '{date_range}' passed")
            else:
                print(f"  ❌ Dashboard API test with date range '{date_range}' failed: Status code {response.status_code}")
                return False
        
        print("✅ Dashboard API test with different date ranges passed")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Dashboard API test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Dashboard API test failed: {str(e)}")
        return False

# ===== ENHANCED TRANSACTIONS API TESTS =====

def test_recent_transactions():
    """Test getting recent transactions"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Recent transactions test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing recent transactions API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/transactions/", 
            headers=headers, 
            params={"recent": "true"},
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
                # Verify that no more than 10 transactions are returned
                if len(data["items"]) <= 10:
                    print(f"✅ Recent transactions test passed (Found {len(data['items'])} transactions)")
                    
                    # Verify sorting by created_at desc
                    if len(data["items"]) > 1:
                        is_sorted = all(
                            datetime.fromisoformat(data["items"][i]["created_at"].replace("Z", "+00:00")) >= 
                            datetime.fromisoformat(data["items"][i+1]["created_at"].replace("Z", "+00:00"))
                            for i in range(len(data["items"])-1)
                        )
                        if is_sorted:
                            print("✅ Transactions are correctly sorted by created_at desc")
                        else:
                            print("❌ Transactions are not correctly sorted by created_at desc")
                            return False
                    
                    return True
                else:
                    print(f"❌ Recent transactions test failed: More than 10 transactions returned ({len(data['items'])})")
                    return False
            else:
                print(f"❌ Recent transactions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Recent transactions test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Recent transactions test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Recent transactions test failed: {str(e)}")
        return False

# ===== ENHANCED INVOICES API TESTS =====

def test_outstanding_invoices():
    """Test getting outstanding invoices"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Outstanding invoices test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing outstanding invoices API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/invoices/", 
            headers=headers, 
            params={"status": "outstanding"},
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
                # Verify that all invoices have balance_due > 0
                all_outstanding = all(invoice.get("balance_due", 0) > 0 for invoice in data["items"])
                if all_outstanding or len(data["items"]) == 0:
                    print(f"✅ Outstanding invoices test passed (Found {len(data['items'])} invoices)")
                    return True
                else:
                    print(f"❌ Outstanding invoices test failed: Not all invoices have balance_due > 0")
                    return False
            else:
                print(f"❌ Outstanding invoices test failed: Unexpected response")
                return False
        else:
            print(f"❌ Outstanding invoices test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Outstanding invoices test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Outstanding invoices test failed: {str(e)}")
        return False

def test_paid_invoices():
    """Test getting paid invoices"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Paid invoices test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing paid invoices API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/invoices/", 
            headers=headers, 
            params={"status": "paid"},
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
                # Verify that all invoices have balance_due = 0
                all_paid = all(invoice.get("balance_due", 1) == 0 for invoice in data["items"])
                if all_paid or len(data["items"]) == 0:
                    print(f"✅ Paid invoices test passed (Found {len(data['items'])} invoices)")
                    return True
                else:
                    print(f"❌ Paid invoices test failed: Not all invoices have balance_due = 0")
                    return False
            else:
                print(f"❌ Paid invoices test failed: Unexpected response")
                return False
        else:
            print(f"❌ Paid invoices test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Paid invoices test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Paid invoices test failed: {str(e)}")
        return False

def test_overdue_invoices():
    """Test getting overdue invoices"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Overdue invoices test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing overdue invoices API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/invoices/", 
            headers=headers, 
            params={"status": "overdue"},
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
                # Verify that all invoices have balance_due > 0 and due_date < today
                today = date.today()
                all_overdue = all(
                    invoice.get("balance_due", 0) > 0 and 
                    datetime.fromisoformat(invoice.get("due_date", today.isoformat())).date() < today 
                    for invoice in data["items"]
                ) if data["items"] else True
                
                if all_overdue:
                    print(f"✅ Overdue invoices test passed (Found {len(data['items'])} invoices)")
                    return True
                else:
                    print(f"❌ Overdue invoices test failed: Not all invoices are overdue")
                    return False
            else:
                print(f"❌ Overdue invoices test failed: Unexpected response")
                return False
        else:
            print(f"❌ Overdue invoices test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Overdue invoices test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Overdue invoices test failed: {str(e)}")
        return False

# Main test function
def run_tests():
    """Run all tests"""
    print("\n🚀 Starting Phase 2.1 Dashboard Integration API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Authentication tests
    if not test_login_demo_user():
        print("\n❌ Authentication failed. Skipping remaining tests.")
        return
    
    # Company access tests
    if not test_get_user_companies():
        print("\n❌ Failed to get user companies. Skipping remaining tests.")
        return
    
    if not test_company_access():
        print("\n❌ Failed to get company access. Skipping remaining tests.")
        return
    
    # Phase 2.1 Dashboard Integration API tests
    print("\n===== PHASE 2.1 DASHBOARD INTEGRATION API TESTS =====")
    
    # Dashboard API test
    test_dashboard_api()
    
    # Enhanced Transactions API test
    test_recent_transactions()
    
    # Enhanced Invoices API tests
    test_outstanding_invoices()
    test_paid_invoices()
    test_overdue_invoices()
    
    print("\n✅ Phase 2.1 Dashboard Integration API tests completed!")

if __name__ == "__main__":
    run_tests()