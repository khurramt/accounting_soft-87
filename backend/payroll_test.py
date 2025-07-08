#!/usr/bin/env python3
"""
Payroll Module Backend Testing Script
Comprehensive testing of all payroll API endpoints
"""
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
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
        if isinstance(o, date):
            return o.isoformat()
        if isinstance(o, datetime):
            return o.isoformat()
        return super(DecimalEncoder, self).default(o)

def pretty_print_json(data):
    """Print JSON data with proper formatting and decimal handling"""
    return json.dumps(data, indent=2, cls=DecimalEncoder)

def test_login_demo_user():
    """Test login with demo user"""
    global ACCESS_TOKEN, REFRESH_TOKEN, SESSION_ID, USER_ID
    
    try:
        print("\n🔍 Testing demo user login...")
        payload = {
            "email": "demo@quickbooks.com",
            "password": "Password123!"
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            ACCESS_TOKEN = data.get("access_token")
            REFRESH_TOKEN = data.get("refresh_token")
            SESSION_ID = data.get("session_id")
            USER_ID = data.get("user", {}).get("user_id")
            print("✅ Login test passed")
            return True
        else:
            print(f"❌ Login test failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login test failed: {str(e)}")
        return False

def test_get_user_companies():
    """Test getting user companies"""
    global COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get companies test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing get user companies...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            companies = data.get("items", [])
            if companies:
                COMPANY_ID = companies[0]["company_id"]
                print(f"✅ Get companies test passed (Found {len(companies)} companies)")
                print(f"Using company ID: {COMPANY_ID}")
                return True
            else:
                print("❌ No companies found")
                return False
        else:
            print(f"❌ Get companies test failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get companies test failed: {str(e)}")
        return False

# ===== PAYROLL ITEMS TESTS =====

def test_get_payroll_items():
    """Test getting payroll items"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll items test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get payroll items...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "item_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-items", 
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
            if "items" in data and "total" in data:
                print(f"✅ Get payroll items test passed (Found {data['total']} items)")
                return True
            else:
                print(f"❌ Get payroll items test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll items test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get payroll items test failed: {str(e)}")
        return False

def test_create_payroll_item():
    """Test creating a payroll item"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create payroll item test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create payroll item...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "item_name": f"Test Payroll Item {timestamp}",
            "item_type": "wages",
            "item_category": "Earnings",
            "calculation_basis": "hourly",
            "rate": 30.00,
            "tax_tracking": "W-2 Wages",
            "is_active": True
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-items", 
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
            if "payroll_item_id" in data and data.get("item_name") == payload["item_name"]:
                item_id = data["payroll_item_id"]
                print(f"✅ Create payroll item test passed (ID: {item_id})")
                return True, item_id
            else:
                print(f"❌ Create payroll item test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create payroll item test failed: Status code {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Create payroll item test failed: {str(e)}")
        return False, None

def test_get_payroll_item_by_id(item_id):
    """Test getting a payroll item by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Get payroll item by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get payroll item by ID: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-items/{item_id}", 
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
            if "payroll_item_id" in data and data["payroll_item_id"] == item_id:
                print("✅ Get payroll item by ID test passed")
                return True
            else:
                print(f"❌ Get payroll item by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll item by ID test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get payroll item by ID test failed: {str(e)}")
        return False

def test_update_payroll_item(item_id):
    """Test updating a payroll item"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Update payroll item test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update payroll item: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "item_name": f"Updated Payroll Item {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "rate": 35.00,
            "item_category": "Updated Earnings"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-items/{item_id}", 
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
            if "payroll_item_id" in data and data["payroll_item_id"] == item_id and data["item_name"] == payload["item_name"]:
                print("✅ Update payroll item test passed")
                return True
            else:
                print(f"❌ Update payroll item test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update payroll item test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Update payroll item test failed: {str(e)}")
        return False

# ===== TIME ENTRIES TESTS =====

def test_create_time_entry():
    """Test creating a time entry"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create time entry test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create time entry...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # First, get an employee from the company
        emp_response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/employees/", 
            headers=headers, 
            params={"page_size": 1},
            timeout=TIMEOUT
        )
        
        if emp_response.status_code != 200 or not emp_response.json().get("items"):
            print("❌ Create time entry test failed: No employees found")
            return False, None
        
        employee_id = emp_response.json()["items"][0]["employee_id"]
        
        payload = {
            "employee_id": employee_id,
            "date": date.today().isoformat(),
            "hours": 8.0,
            "break_hours": 1.0,
            "overtime_hours": 0.0,
            "hourly_rate": 25.50,
            "description": "Regular work day - Testing",
            "billable": True
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/time-entries", 
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
            if "time_entry_id" in data and data.get("employee_id") == employee_id:
                entry_id = data["time_entry_id"]
                print(f"✅ Create time entry test passed (ID: {entry_id})")
                return True, entry_id
            else:
                print(f"❌ Create time entry test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create time entry test failed: Status code {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Create time entry test failed: {str(e)}")
        return False, None

def test_get_time_entries():
    """Test getting time entries"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get time entries test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get time entries...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "date",
            "sort_order": "desc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/time-entries", 
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
            if "items" in data and "total" in data:
                print(f"✅ Get time entries test passed (Found {data['total']} entries)")
                return True
            else:
                print(f"❌ Get time entries test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get time entries test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get time entries test failed: {str(e)}")
        return False

# ===== PAYROLL RUNS TESTS =====

def test_create_payroll_run():
    """Test creating a payroll run"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create payroll run test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create payroll run...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Calculate pay period dates
        today = date.today()
        pay_period_end = today
        pay_period_start = today - timedelta(days=13)  # 2 weeks
        pay_date = today + timedelta(days=2)  # Pay 2 days after period end
        
        payload = {
            "pay_period_start": pay_period_start.isoformat(),
            "pay_period_end": pay_period_end.isoformat(),
            "pay_date": pay_date.isoformat(),
            "run_type": "regular"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs", 
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
            if "payroll_run_id" in data:
                run_id = data["payroll_run_id"]
                print(f"✅ Create payroll run test passed (ID: {run_id})")
                return True, run_id
            else:
                print(f"❌ Create payroll run test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create payroll run test failed: Status code {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Create payroll run test failed: {str(e)}")
        return False, None

def test_get_payroll_runs():
    """Test getting payroll runs"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll runs test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get payroll runs...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "pay_date",
            "sort_order": "desc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs", 
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
            if "items" in data and "total" in data:
                print(f"✅ Get payroll runs test passed (Found {data['total']} runs)")
                return True
            else:
                print(f"❌ Get payroll runs test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll runs test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get payroll runs test failed: {str(e)}")
        return False

def test_calculate_payroll_run(run_id):
    """Test calculating payroll for a run"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not run_id:
        print("❌ Calculate payroll run test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing calculate payroll run: {run_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs/{run_id}/calculate", 
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
            if "calculations" in data and "total_gross_pay" in data:
                print(f"✅ Calculate payroll run test passed")
                return True
            else:
                print(f"❌ Calculate payroll run test failed: Unexpected response")
                return False
        else:
            print(f"❌ Calculate payroll run test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Calculate payroll run test failed: {str(e)}")
        return False

# ===== PAYROLL LIABILITIES TESTS =====

def test_get_payroll_liabilities():
    """Test getting payroll liabilities"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll liabilities test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get payroll liabilities...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "due_date",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-liabilities", 
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
            if "items" in data and "total" in data:
                print(f"✅ Get payroll liabilities test passed (Found {data['total']} liabilities)")
                return True
            else:
                print(f"❌ Get payroll liabilities test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll liabilities test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get payroll liabilities test failed: {str(e)}")
        return False

def test_get_due_payroll_liabilities():
    """Test getting due payroll liabilities"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get due payroll liabilities test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get due payroll liabilities...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "days_ahead": 30
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-liabilities/due", 
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
            if "items" in data:
                print(f"✅ Get due payroll liabilities test passed (Found {len(data['items'])} due liabilities)")
                return True
            else:
                print(f"❌ Get due payroll liabilities test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get due payroll liabilities test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get due payroll liabilities test failed: {str(e)}")
        return False

def run_payroll_tests():
    """Run all payroll module tests"""
    print("\n🚀 Starting QuickBooks Clone Payroll Module API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {}
    
    # Login and get company access
    results["login_demo_user"] = test_login_demo_user()
    if results["login_demo_user"]:
        results["get_user_companies"] = test_get_user_companies()
        if not COMPANY_ID:
            print("❌ No company ID available, skipping company-specific tests")
            return False
    else:
        print("❌ Login failed, skipping all other tests")
        return False
    
    # Test Payroll Items API
    print("\n📋 Testing Payroll Items API...")
    results["get_payroll_items"] = test_get_payroll_items()
    
    item_result, item_id = test_create_payroll_item()
    results["create_payroll_item"] = item_result
    
    if item_id:
        results["get_payroll_item_by_id"] = test_get_payroll_item_by_id(item_id)
        results["update_payroll_item"] = test_update_payroll_item(item_id)
    
    # Test Time Entries API
    print("\n📋 Testing Time Entries API...")
    results["get_time_entries"] = test_get_time_entries()
    
    entry_result, entry_id = test_create_time_entry()
    results["create_time_entry"] = entry_result
    
    # Test Payroll Runs API
    print("\n📋 Testing Payroll Runs API...")
    results["get_payroll_runs"] = test_get_payroll_runs()
    
    run_result, run_id = test_create_payroll_run()
    results["create_payroll_run"] = run_result
    
    if run_id:
        results["calculate_payroll_run"] = test_calculate_payroll_run(run_id)
    
    # Test Payroll Liabilities API
    print("\n📋 Testing Payroll Liabilities API...")
    results["get_payroll_liabilities"] = test_get_payroll_liabilities()
    results["get_due_payroll_liabilities"] = test_get_due_payroll_liabilities()
    
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
    success = run_payroll_tests()
    sys.exit(0 if success else 1)