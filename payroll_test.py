#!/usr/bin/env python3
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

# ===== PAYROLL ITEMS API TESTS =====

def test_get_payroll_items():
    """Test getting payroll items with filtering and pagination"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll items test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get payroll items...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "item_name",
            "sort_order": "asc",
            "item_type": "wages"
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
            if "items" in data and "total" in data and "page" in data:
                print(f"✅ Get payroll items test passed (Found {data['total']} items)")
                return True
            else:
                print(f"❌ Get payroll items test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll items test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get payroll items test failed: Request timed out after {TIMEOUT} seconds")
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
        
        # Generate a unique item name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "item_name": f"Test Payroll Item {timestamp}",
            "item_type": "wages",
            "item_category": "Regular Pay",
            "rate": 25.50,
            "calculation_basis": "hourly",
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
    except requests.exceptions.Timeout:
        print(f"❌ Create payroll item test failed: Request timed out after {TIMEOUT} seconds")
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
    except requests.exceptions.Timeout:
        print(f"❌ Get payroll item by ID test failed: Request timed out after {TIMEOUT} seconds")
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
        
        # Updated payroll item data
        payload = {
            "item_name": f"Updated Payroll Item {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "rate": 28.75,
            "item_category": "Updated Category"
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
    except requests.exceptions.Timeout:
        print(f"❌ Update payroll item test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update payroll item test failed: {str(e)}")
        return False

def test_delete_payroll_item(item_id):
    """Test deleting a payroll item (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not item_id:
        print("❌ Delete payroll item test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete payroll item: {item_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
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
            if "message" in data and "deleted" in data["message"].lower():
                print("✅ Delete payroll item test passed")
                return True
            else:
                print(f"❌ Delete payroll item test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete payroll item test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete payroll item test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete payroll item test failed: {str(e)}")
        return False

# ===== EMPLOYEE PAYROLL INFO API TESTS =====

def test_get_employees():
    """Test getting employees to use for payroll tests"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get employees test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing get employees...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/employees/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False, None
        
        if response.status_code == 200:
            if "items" in data and len(data["items"]) > 0:
                employee_id = data["items"][0]["employee_id"]
                print(f"✅ Get employees test passed (Using employee ID: {employee_id})")
                return True, employee_id
            else:
                print(f"❌ Get employees test failed: No employees found")
                return False, None
        else:
            print(f"❌ Get employees test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Get employees test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Get employees test failed: {str(e)}")
        return False, None

def test_get_employee_payroll_info(employee_id):
    """Test getting payroll information for an employee"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Get employee payroll info test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get employee payroll info for employee ID: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/employees/{employee_id}/payroll", 
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
            if "employee_payroll_id" in data and data["employee_id"] == employee_id:
                print("✅ Get employee payroll info test passed")
                return True
            else:
                print(f"❌ Get employee payroll info test failed: Unexpected response")
                return False
        elif response.status_code == 404:
            # If no payroll info exists yet, we'll create it in the next test
            print("ℹ️ No payroll info found for employee, will create in next test")
            return True
        else:
            print(f"❌ Get employee payroll info test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get employee payroll info test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get employee payroll info test failed: {str(e)}")
        return False

def test_update_employee_payroll_info(employee_id):
    """Test updating payroll information for an employee"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Update employee payroll info test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update employee payroll info for employee ID: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "pay_frequency": "biweekly",
            "pay_type": "hourly",
            "hourly_rate": 25.50,
            "overtime_rate": 38.25,
            "federal_filing_status": "single",
            "federal_allowances": 1,
            "federal_extra_withholding": 0,
            "state_filing_status": "single",
            "state_allowances": 1,
            "state_code": "CA",
            "sick_hours_available": 40,
            "vacation_hours_available": 80
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/employees/{employee_id}/payroll", 
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
            if "employee_payroll_id" in data and data["employee_id"] == employee_id:
                print("✅ Update employee payroll info test passed")
                return True
            else:
                print(f"❌ Update employee payroll info test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update employee payroll info test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update employee payroll info test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update employee payroll info test failed: {str(e)}")
        return False

# ===== TIME ENTRIES API TESTS =====

def test_create_time_entry(employee_id):
    """Test creating a time entry"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not employee_id:
        print("❌ Create time entry test skipped: Missing required data")
        return False, None
    
    try:
        print(f"\n🔍 Testing create time entry for employee ID: {employee_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Create a time entry for yesterday
        entry_date = (datetime.now() - timedelta(days=1)).date()
        
        payload = {
            "employee_id": employee_id,
            "date": entry_date.isoformat(),
            "hours": 8,
            "overtime_hours": 2,
            "description": "Regular work day",
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
            if "time_entry_id" in data and data["employee_id"] == employee_id:
                entry_id = data["time_entry_id"]
                print(f"✅ Create time entry test passed (ID: {entry_id})")
                return True, entry_id
            else:
                print(f"❌ Create time entry test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create time entry test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create time entry test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create time entry test failed: {str(e)}")
        return False, None

def test_get_time_entries():
    """Test getting time entries with filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get time entries test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get time entries...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "date",
            "sort_order": "desc",
            "billable": True
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
            if "items" in data and "total" in data and "page" in data:
                print(f"✅ Get time entries test passed (Found {data['total']} entries)")
                return True
            else:
                print(f"❌ Get time entries test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get time entries test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get time entries test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get time entries test failed: {str(e)}")
        return False

def test_get_time_entry_by_id(entry_id):
    """Test getting a time entry by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not entry_id:
        print("❌ Get time entry by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get time entry by ID: {entry_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/time-entries/{entry_id}", 
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
            if "time_entry_id" in data and data["time_entry_id"] == entry_id:
                print("✅ Get time entry by ID test passed")
                return True
            else:
                print(f"❌ Get time entry by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get time entry by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get time entry by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get time entry by ID test failed: {str(e)}")
        return False

def test_update_time_entry(entry_id):
    """Test updating a time entry"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not entry_id:
        print("❌ Update time entry test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update time entry: {entry_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "hours": 9,
            "description": "Updated work description",
            "approved": True
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/time-entries/{entry_id}", 
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
            if "time_entry_id" in data and data["time_entry_id"] == entry_id and data["hours"] == 9:
                print("✅ Update time entry test passed")
                return True
            else:
                print(f"❌ Update time entry test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update time entry test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update time entry test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update time entry test failed: {str(e)}")
        return False

def test_delete_time_entry(entry_id):
    """Test deleting a time entry"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not entry_id:
        print("❌ Delete time entry test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete time entry: {entry_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/time-entries/{entry_id}", 
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
            if "message" in data and "deleted" in data["message"].lower():
                print("✅ Delete time entry test passed")
                return True
            else:
                print(f"❌ Delete time entry test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete time entry test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete time entry test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete time entry test failed: {str(e)}")
        return False

# ===== PAYROLL RUNS API TESTS =====

def test_create_payroll_run():
    """Test creating a payroll run"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create payroll run test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create payroll run...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Create a payroll run for the current pay period
        today = datetime.now().date()
        pay_period_start = today - timedelta(days=14)  # Two weeks ago
        pay_period_end = today - timedelta(days=1)     # Yesterday
        pay_date = today + timedelta(days=3)           # 3 days from now
        
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
            if "payroll_run_id" in data and data["status"] == "draft":
                run_id = data["payroll_run_id"]
                print(f"✅ Create payroll run test passed (ID: {run_id})")
                return True, run_id
            else:
                print(f"❌ Create payroll run test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create payroll run test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create payroll run test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create payroll run test failed: {str(e)}")
        return False, None

def test_get_payroll_runs():
    """Test getting payroll runs with filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll runs test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get payroll runs...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
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
            if "items" in data and "total" in data and "page" in data:
                print(f"✅ Get payroll runs test passed (Found {data['total']} runs)")
                return True
            else:
                print(f"❌ Get payroll runs test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll runs test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get payroll runs test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get payroll runs test failed: {str(e)}")
        return False

def test_get_payroll_run_by_id(run_id):
    """Test getting a payroll run by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not run_id:
        print("❌ Get payroll run by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get payroll run by ID: {run_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs/{run_id}", 
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
            if "payroll_run_id" in data and data["payroll_run_id"] == run_id:
                print("✅ Get payroll run by ID test passed")
                return True
            else:
                print(f"❌ Get payroll run by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get payroll run by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get payroll run by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get payroll run by ID test failed: {str(e)}")
        return False

def test_calculate_payroll_run(run_id):
    """Test calculating a payroll run"""
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
            if "payroll_run_id" in data and "calculations" in data:
                print("✅ Calculate payroll run test passed")
                return True
            else:
                print(f"❌ Calculate payroll run test failed: Unexpected response")
                return False
        else:
            print(f"❌ Calculate payroll run test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Calculate payroll run test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Calculate payroll run test failed: {str(e)}")
        return False

def test_process_payroll_run(run_id):
    """Test processing a payroll run"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not run_id:
        print("❌ Process payroll run test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing process payroll run: {run_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "processing_date": datetime.now().date().isoformat()
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs/{run_id}/process", 
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
            if "payroll_run_id" in data and data["status"] == "calculated":
                print("✅ Process payroll run test passed")
                return True
            else:
                print(f"❌ Process payroll run test failed: Unexpected response")
                return False
        else:
            print(f"❌ Process payroll run test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Process payroll run test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Process payroll run test failed: {str(e)}")
        return False

def test_approve_payroll_run(run_id):
    """Test approving a payroll run"""
    global ACCESS_TOKEN, COMPANY_ID, USER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not run_id or not USER_ID:
        print("❌ Approve payroll run test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing approve payroll run: {run_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "approved_by": USER_ID
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-runs/{run_id}/approve", 
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
            if "payroll_run_id" in data and data["status"] == "approved":
                print("✅ Approve payroll run test passed")
                return True
            else:
                print(f"❌ Approve payroll run test failed: Unexpected response")
                return False
        else:
            print(f"❌ Approve payroll run test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Approve payroll run test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Approve payroll run test failed: {str(e)}")
        return False

# ===== PAYCHECKS API TESTS =====

def test_get_paychecks():
    """Test getting paychecks with filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get paychecks test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing get paychecks...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "pay_date",
            "sort_order": "desc",
            "is_void": False
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/paychecks", 
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
            return False, None
        
        if response.status_code == 200:
            if "items" in data and "total" in data and "page" in data:
                paycheck_id = None
                if data["total"] > 0 and len(data["items"]) > 0:
                    paycheck_id = data["items"][0]["paycheck_id"]
                print(f"✅ Get paychecks test passed (Found {data['total']} paychecks)")
                return True, paycheck_id
            else:
                print(f"❌ Get paychecks test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Get paychecks test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Get paychecks test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Get paychecks test failed: {str(e)}")
        return False, None

def test_get_paycheck_by_id(paycheck_id):
    """Test getting a paycheck by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not paycheck_id:
        print("❌ Get paycheck by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get paycheck by ID: {paycheck_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/paychecks/{paycheck_id}", 
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
            if "paycheck_id" in data and data["paycheck_id"] == paycheck_id:
                print("✅ Get paycheck by ID test passed")
                return True
            else:
                print(f"❌ Get paycheck by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get paycheck by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get paycheck by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get paycheck by ID test failed: {str(e)}")
        return False

def test_void_paycheck(paycheck_id):
    """Test voiding a paycheck"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not paycheck_id:
        print("❌ Void paycheck test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing void paycheck: {paycheck_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "reason": "Testing void functionality"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/paychecks/{paycheck_id}/void", 
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
            if "paycheck_id" in data and data["is_void"] == True:
                print("✅ Void paycheck test passed")
                return True
            else:
                print(f"❌ Void paycheck test failed: Unexpected response")
                return False
        else:
            print(f"❌ Void paycheck test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Void paycheck test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Void paycheck test failed: {str(e)}")
        return False

# ===== PAYROLL LIABILITIES API TESTS =====

def test_get_payroll_liabilities():
    """Test getting payroll liabilities with filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get payroll liabilities test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing get payroll liabilities...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "due_date",
            "sort_order": "asc",
            "status": "pending"
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
            return False, None
        
        if response.status_code == 200:
            if "items" in data and "total" in data and "page" in data:
                liability_id = None
                if data["total"] > 0 and len(data["items"]) > 0:
                    liability_id = data["items"][0]["liability_id"]
                print(f"✅ Get payroll liabilities test passed (Found {data['total']} liabilities)")
                return True, liability_id
            else:
                print(f"❌ Get payroll liabilities test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Get payroll liabilities test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Get payroll liabilities test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Get payroll liabilities test failed: {str(e)}")
        return False, None

def test_get_due_payroll_liabilities():
    """Test getting due payroll liabilities"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get due payroll liabilities test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get due payroll liabilities...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with days ahead parameter
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
            if "items" in data and "total" in data:
                print(f"✅ Get due payroll liabilities test passed (Found {data['total']} due liabilities)")
                return True
            else:
                print(f"❌ Get due payroll liabilities test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get due payroll liabilities test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get due payroll liabilities test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get due payroll liabilities test failed: {str(e)}")
        return False

def test_pay_payroll_liability(liability_id):
    """Test paying a payroll liability"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not liability_id:
        print("❌ Pay payroll liability test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing pay payroll liability: {liability_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "payment_date": datetime.now().date().isoformat(),
            "payment_method": "Check",
            "payment_reference": "12345",
            "payment_amount": 100.00
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/payroll-liabilities/{liability_id}/pay", 
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
            if "liability_id" in data and data["liability_id"] == liability_id:
                status = data.get("status")
                if status in ["paid", "partial"]:
                    print(f"✅ Pay payroll liability test passed (Status: {status})")
                    return True
                else:
                    print(f"❌ Pay payroll liability test failed: Unexpected status {status}")
                    return False
            else:
                print(f"❌ Pay payroll liability test failed: Unexpected response")
                return False
        else:
            print(f"❌ Pay payroll liability test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Pay payroll liability test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Pay payroll liability test failed: {str(e)}")
        return False

def run_payroll_module_tests():
    """Run all Payroll Module API tests"""
    print("\n🔍 Starting QuickBooks Clone Payroll Module API tests...")
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
    
    # Test Payroll Items API
    print("\n📋 Testing Payroll Items API...")
    results["get_payroll_items"] = test_get_payroll_items()
    
    payroll_item_result, payroll_item_id = test_create_payroll_item()
    results["create_payroll_item"] = payroll_item_result
    
    if payroll_item_id:
        results["get_payroll_item_by_id"] = test_get_payroll_item_by_id(payroll_item_id)
        results["update_payroll_item"] = test_update_payroll_item(payroll_item_id)
        results["delete_payroll_item"] = test_delete_payroll_item(payroll_item_id)
    
    # Test Employee Payroll Info API
    print("\n📋 Testing Employee Payroll Info API...")
    employee_result, employee_id = test_get_employees()
    results["get_employees"] = employee_result
    
    if employee_id:
        results["get_employee_payroll_info"] = test_get_employee_payroll_info(employee_id)
        results["update_employee_payroll_info"] = test_update_employee_payroll_info(employee_id)
    
    # Test Time Entries API
    print("\n📋 Testing Time Entries API...")
    if employee_id:
        time_entry_result, time_entry_id = test_create_time_entry(employee_id)
        results["create_time_entry"] = time_entry_result
        
        results["get_time_entries"] = test_get_time_entries()
        
        if time_entry_id:
            results["get_time_entry_by_id"] = test_get_time_entry_by_id(time_entry_id)
            results["update_time_entry"] = test_update_time_entry(time_entry_id)
            results["delete_time_entry"] = test_delete_time_entry(time_entry_id)
    
    # Test Payroll Runs API
    print("\n📋 Testing Payroll Runs API...")
    payroll_run_result, payroll_run_id = test_create_payroll_run()
    results["create_payroll_run"] = payroll_run_result
    
    results["get_payroll_runs"] = test_get_payroll_runs()
    
    if payroll_run_id:
        results["get_payroll_run_by_id"] = test_get_payroll_run_by_id(payroll_run_id)
        results["calculate_payroll_run"] = test_calculate_payroll_run(payroll_run_id)
        results["process_payroll_run"] = test_process_payroll_run(payroll_run_id)
        results["approve_payroll_run"] = test_approve_payroll_run(payroll_run_id)
    
    # Test Paychecks API
    print("\n📋 Testing Paychecks API...")
    paychecks_result, paycheck_id = test_get_paychecks()
    results["get_paychecks"] = paychecks_result
    
    if paycheck_id:
        results["get_paycheck_by_id"] = test_get_paycheck_by_id(paycheck_id)
        results["void_paycheck"] = test_void_paycheck(paycheck_id)
    
    # Test Payroll Liabilities API
    print("\n📋 Testing Payroll Liabilities API...")
    liabilities_result, liability_id = test_get_payroll_liabilities()
    results["get_payroll_liabilities"] = liabilities_result
    
    results["get_due_payroll_liabilities"] = test_get_due_payroll_liabilities()
    
    if liability_id:
        results["pay_payroll_liability"] = test_pay_payroll_liability(liability_id)
    
    # Print summary
    print("\n📊 Payroll Module API Test Summary:")
    success_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    print(f"✅ {success_count}/{total_count} tests passed ({success_count/total_count*100:.1f}%)")
    
    for test_name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    return success_count == total_count

if __name__ == "__main__":
    # Run basic health checks
    test_root_endpoint()
    test_health_endpoint()
    
    # Run payroll module tests
    run_payroll_module_tests()