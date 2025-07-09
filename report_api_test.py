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
import time

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
SESSION_ID = None
USER_ID = None
COMPANY_ID = None
CUSTOMER_ID = None
VENDOR_ID = None
ACCOUNT_ID = None
TRANSACTION_ID = None
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

# ===== REPORT API TESTS =====

def test_profit_loss_report():
    """Test getting profit and loss report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Profit and Loss report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Profit and Loss report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        
        # Test with various parameters
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "comparison_type": "none",
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", 
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
            print("✅ Profit and Loss report test passed")
            return True
        else:
            print(f"❌ Profit and Loss report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Profit and Loss report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Profit and Loss report test failed: {str(e)}")
        return False

def test_balance_sheet_report():
    """Test getting balance sheet report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Balance Sheet report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Balance Sheet report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        
        # Test with various parameters
        params = {
            "as_of_date": today.isoformat(),
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/balance-sheet", 
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
            print("✅ Balance Sheet report test passed")
            return True
        else:
            print(f"❌ Balance Sheet report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Balance Sheet report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Balance Sheet report test failed: {str(e)}")
        return False

def test_cash_flow_report():
    """Test getting cash flow report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Cash Flow report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Cash Flow report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        
        # Test with various parameters
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "method": "indirect",
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/cash-flow", 
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
            print("✅ Cash Flow report test passed")
            return True
        else:
            print(f"❌ Cash Flow report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Cash Flow report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Cash Flow report test failed: {str(e)}")
        return False

def test_report_with_invalid_company_id():
    """Test report with invalid company ID"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Report with invalid company ID test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing report with invalid company ID...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        
        # Use an invalid company ID
        invalid_company_id = "invalid-company-id"
        
        params = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        response = requests.get(
            f"{API_URL}/companies/{invalid_company_id}/reports/profit-loss", 
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
        
        if response.status_code in [403, 404]:
            print("✅ Report with invalid company ID test passed (received expected error response)")
            return True
        else:
            print(f"❌ Report with invalid company ID test failed: Unexpected status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Report with invalid company ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Report with invalid company ID test failed: {str(e)}")
        return False

def test_report_with_missing_parameters():
    """Test report with missing required parameters"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Report with missing parameters test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing report with missing parameters...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Intentionally omit required parameters
        params = {}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", 
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
        
        if response.status_code in [400, 422]:
            print("✅ Report with missing parameters test passed (received expected error response)")
            return True
        else:
            print(f"❌ Report with missing parameters test failed: Unexpected status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Report with missing parameters test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Report with missing parameters test failed: {str(e)}")
        return False

def test_profit_loss_with_comparison():
    """Test profit and loss report with comparison period"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Profit and Loss with comparison test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Profit and Loss report with comparison period...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        comparison_start_date = (today - timedelta(days=60)).isoformat()
        comparison_end_date = (today - timedelta(days=31)).isoformat()
        
        # Test with comparison parameters
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "comparison_type": "custom",
            "comparison_start_date": comparison_start_date,
            "comparison_end_date": comparison_end_date,
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", 
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
            print("✅ Profit and Loss report with comparison test passed")
            return True
        else:
            print(f"❌ Profit and Loss report with comparison test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Profit and Loss report with comparison test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Profit and Loss report with comparison test failed: {str(e)}")
        return False

def test_balance_sheet_with_comparison():
    """Test balance sheet report with comparison date"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Balance Sheet with comparison test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Balance Sheet report with comparison date...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        comparison_date = (today - timedelta(days=30)).isoformat()
        
        # Test with comparison parameters
        params = {
            "as_of_date": today.isoformat(),
            "comparison_date": comparison_date,
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/balance-sheet", 
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
            print("✅ Balance Sheet report with comparison test passed")
            return True
        else:
            print(f"❌ Balance Sheet report with comparison test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Balance Sheet report with comparison test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Balance Sheet report with comparison test failed: {str(e)}")
        return False

def test_cash_flow_with_direct_method():
    """Test cash flow report with direct method"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Cash Flow with direct method test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Cash Flow report with direct method...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Set up date parameters
        today = date.today()
        start_date = (today - timedelta(days=30)).isoformat()
        end_date = today.isoformat()
        
        # Test with direct method
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "method": "direct",
            "include_subtotals": True,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/cash-flow", 
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
            print("✅ Cash Flow report with direct method test passed")
            return True
        else:
            print(f"❌ Cash Flow report with direct method test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Cash Flow report with direct method test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Cash Flow report with direct method test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Basic API tests
    test_root_endpoint()
    test_health_endpoint()
    
    # Authentication tests
    if not test_login_demo_user():
        print("\n❌ Authentication failed, skipping remaining tests")
        sys.exit(1)
    
    # Company access tests
    if not test_get_user_companies():
        print("\n❌ Failed to get companies, skipping remaining tests")
        sys.exit(1)
    
    if not test_company_access():
        print("\n❌ Failed to access company, skipping remaining tests")
        sys.exit(1)
    
    # Report API tests
    print("\n===== TESTING REPORT APIs =====")
    test_profit_loss_report()
    test_balance_sheet_report()
    test_cash_flow_report()
    test_report_with_invalid_company_id()
    test_report_with_missing_parameters()
    test_profit_loss_with_comparison()
    test_balance_sheet_with_comparison()
    test_cash_flow_with_direct_method()
    
    print("\n===== ALL TESTS COMPLETED =====")