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

# ===== REPORTING ENGINE TESTS =====

def test_get_reports():
    """Test getting available reports"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get reports test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get reports...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "report_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports", 
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
                print(f"✅ Get reports test passed (Found {data['total']} reports)")
                return True
            else:
                print(f"❌ Get reports test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get reports test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get reports test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get reports test failed: {str(e)}")
        return False

def test_profit_loss_report():
    """Test generating a profit and loss report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Profit & Loss report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Profit & Loss report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date and first day of month for date range
        today = datetime.now().date()
        first_day = today.replace(day=1)
        
        params = {
            "start_date": first_day.isoformat(),
            "end_date": today.isoformat(),
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
            if "report_name" in data and "sections" in data:
                print(f"✅ Profit & Loss report test passed")
                return True
            else:
                print(f"❌ Profit & Loss report test failed: Unexpected response")
                return False
        else:
            print(f"❌ Profit & Loss report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Profit & Loss report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Profit & Loss report test failed: {str(e)}")
        return False

def test_balance_sheet_report():
    """Test generating a balance sheet report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Balance Sheet report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Balance Sheet report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date for as_of_date
        today = datetime.now().date()
        
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
            if "report_name" in data and "sections" in data:
                print(f"✅ Balance Sheet report test passed")
                return True
            else:
                print(f"❌ Balance Sheet report test failed: Unexpected response")
                return False
        else:
            print(f"❌ Balance Sheet report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Balance Sheet report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Balance Sheet report test failed: {str(e)}")
        return False

def test_trial_balance_report():
    """Test generating a trial balance report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Trial Balance report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Trial Balance report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date for as_of_date
        today = datetime.now().date()
        
        params = {
            "as_of_date": today.isoformat(),
            "include_zero_balances": False,
            "show_cents": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/trial-balance", 
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
            if "data" in data and "summary" in data:
                print(f"✅ Trial Balance report test passed")
                return True
            else:
                print(f"❌ Trial Balance report test failed: Unexpected response")
                return False
        else:
            print(f"❌ Trial Balance report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Trial Balance report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Trial Balance report test failed: {str(e)}")
        return False

def test_cash_flow_report():
    """Test generating a cash flow report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Cash Flow report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing Cash Flow report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date and first day of month for date range
        today = datetime.now().date()
        first_day = today.replace(day=1)
        
        params = {
            "start_date": first_day.isoformat(),
            "end_date": today.isoformat(),
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
            if "report_name" in data and "sections" in data:
                print(f"✅ Cash Flow report test passed")
                return True
            else:
                print(f"❌ Cash Flow report test failed: Unexpected response")
                return False
        else:
            print(f"❌ Cash Flow report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Cash Flow report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Cash Flow report test failed: {str(e)}")
        return False

def test_ar_aging_report():
    """Test generating an accounts receivable aging report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ AR Aging report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing AR Aging report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date for as_of_date
        today = datetime.now().date()
        
        params = {
            "as_of_date": today.isoformat(),
            "aging_periods": [30, 60, 90, 120],
            "include_zero_balances": False
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/ar-aging", 
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
            if "data" in data and "summary" in data:
                print(f"✅ AR Aging report test passed")
                return True
            else:
                print(f"❌ AR Aging report test failed: Unexpected response")
                return False
        else:
            print(f"❌ AR Aging report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ AR Aging report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ AR Aging report test failed: {str(e)}")
        return False

def test_ap_aging_report():
    """Test generating an accounts payable aging report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ AP Aging report test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing AP Aging report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Get current date for as_of_date
        today = datetime.now().date()
        
        params = {
            "as_of_date": today.isoformat(),
            "aging_periods": [30, 60, 90, 120],
            "include_zero_balances": False
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/ap-aging", 
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
            if "data" in data and "summary" in data:
                print(f"✅ AP Aging report test passed")
                return True
            else:
                print(f"❌ AP Aging report test failed: Unexpected response")
                return False
        else:
            print(f"❌ AP Aging report test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ AP Aging report test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ AP Aging report test failed: {str(e)}")
        return False

def test_create_memorized_report():
    """Test creating a memorized report"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create memorized report test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create memorized report...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # First, get a report ID to memorize
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports", 
            headers=headers, 
            timeout=TIMEOUT
        )
        
        if response.status_code != 200:
            print(f"❌ Create memorized report test failed: Could not get reports list")
            return False, None
        
        reports_data = response.json()
        if not reports_data.get("items"):
            print(f"❌ Create memorized report test failed: No reports available to memorize")
            return False, None
        
        # Get the first report ID
        report_id = reports_data["items"][0]["report_id"]
        
        # Create a memorized report
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "report_id": report_id,
            "report_name": f"Memorized Report {timestamp}",
            "parameters": {
                "start_date": datetime.now().date().replace(day=1).isoformat(),
                "end_date": datetime.now().date().isoformat()
            },
            "filters": [],
            "is_scheduled": False
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/memorized-reports", 
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
        
        if response.status_code == 201 or response.status_code == 200:
            if "memorized_report_id" in data and data.get("report_name") == payload["report_name"]:
                memorized_id = data["memorized_report_id"]
                print(f"✅ Create memorized report test passed (ID: {memorized_id})")
                return True, memorized_id
            else:
                print(f"❌ Create memorized report test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create memorized report test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create memorized report test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create memorized report test failed: {str(e)}")
        return False, None

def test_get_memorized_reports():
    """Test getting memorized reports"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get memorized reports test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get memorized reports...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "report_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/memorized-reports", 
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
                print(f"✅ Get memorized reports test passed (Found {data['total']} memorized reports)")
                return True
            else:
                print(f"❌ Get memorized reports test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get memorized reports test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get memorized reports test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get memorized reports test failed: {str(e)}")
        return False

def test_create_report_group():
    """Test creating a report group"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create report group test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create report group...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique group name
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "group_name": f"Test Group {timestamp}",
            "description": "Test group created via API",
            "sort_order": 1
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/report-groups", 
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
        
        if response.status_code == 201 or response.status_code == 200:
            if "group_id" in data and data.get("group_name") == payload["group_name"]:
                group_id = data["group_id"]
                print(f"✅ Create report group test passed (ID: {group_id})")
                return True, group_id
            else:
                print(f"❌ Create report group test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create report group test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create report group test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create report group test failed: {str(e)}")
        return False, None

def test_get_report_groups():
    """Test getting report groups"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get report groups test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get report groups...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/report-groups", 
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
            print(f"✅ Get report groups test passed (Found {len(data)} groups)")
            return True
        else:
            print(f"❌ Get report groups test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get report groups test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get report groups test failed: {str(e)}")
        return False

def test_export_report_to_pdf():
    """Test exporting a report to PDF"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Export report to PDF test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing export report to PDF...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # First, get a report ID to export
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports", 
            headers=headers, 
            timeout=TIMEOUT
        )
        
        if response.status_code != 200:
            print(f"❌ Export report to PDF test failed: Could not get reports list")
            return False
        
        reports_data = response.json()
        if not reports_data.get("items"):
            print(f"❌ Export report to PDF test failed: No reports available to export")
            return False
        
        # Get the first report ID
        report_id = reports_data["items"][0]["report_id"]
        
        # Export the report to PDF
        payload = {
            "format": "pdf",
            "parameters": {
                "start_date": datetime.now().date().replace(day=1).isoformat(),
                "end_date": datetime.now().date().isoformat()
            },
            "filters": [],
            "include_summary": True,
            "page_orientation": "portrait",
            "page_size": "letter"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/reports/definition/{report_id}/export/pdf", 
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
            if "file_url" in data and "file_name" in data:
                print(f"✅ Export report to PDF test passed")
                return True
            else:
                print(f"❌ Export report to PDF test failed: Unexpected response")
                return False
        else:
            print(f"❌ Export report to PDF test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Export report to PDF test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Export report to PDF test failed: {str(e)}")
        return False

def run_reporting_engine_tests():
    """Run all Reporting Engine Module API tests"""
    print("\n🔍 Starting QuickBooks Clone Reporting Engine Module API tests...")
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
    
    # Test Reports API
    print("\n📋 Testing Reports API...")
    results["get_reports"] = test_get_reports()
    
    # Test Standard Financial Reports
    print("\n📋 Testing Standard Financial Reports...")
    results["profit_loss_report"] = test_profit_loss_report()
    results["balance_sheet_report"] = test_balance_sheet_report()
    results["trial_balance_report"] = test_trial_balance_report()
    results["cash_flow_report"] = test_cash_flow_report()
    results["ar_aging_report"] = test_ar_aging_report()
    results["ap_aging_report"] = test_ap_aging_report()
    
    # Test Memorized Reports
    print("\n📋 Testing Memorized Reports...")
    memorized_result, memorized_id = test_create_memorized_report()
    results["create_memorized_report"] = memorized_result
    results["get_memorized_reports"] = test_get_memorized_reports()
    
    # Test Report Groups
    print("\n📋 Testing Report Groups...")
    group_result, group_id = test_create_report_group()
    results["create_report_group"] = group_result
    results["get_report_groups"] = test_get_report_groups()
    
    # Test Report Export
    print("\n📋 Testing Report Export...")
    results["export_report_to_pdf"] = test_export_report_to_pdf()
    
    # Print summary
    print("\n📊 Reporting Engine Module Test Summary:")
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    # Overall result
    all_passed = all(results.values())
    print(f"\n🏁 Overall result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return all_passed

if __name__ == "__main__":
    # Run the reporting engine tests
    success = run_reporting_engine_tests()
    sys.exit(0 if success else 1)