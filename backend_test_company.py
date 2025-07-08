#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime
import uuid
import io

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

# Global variables to store auth tokens
ACCESS_TOKEN = None
REFRESH_TOKEN = None
USER_ID = None
COMPANY_ID = None
TOKEN_TYPE = None

def test_login_demo_user():
    """Test login with demo user"""
    global ACCESS_TOKEN, REFRESH_TOKEN, USER_ID, TOKEN_TYPE
    
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
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "access_token" in data and "refresh_token" in data and "user" in data:
                ACCESS_TOKEN = data["access_token"]
                REFRESH_TOKEN = data["refresh_token"]
                USER_ID = data["user"]["user_id"]
                TOKEN_TYPE = data["token_type"]
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

def test_get_companies():
    """Test getting all companies for the authenticated user"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN:
        print("❌ Get companies test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing GET /api/companies...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                if len(data) > 0:
                    COMPANY_ID = data[0]["company_id"]
                    print(f"Found company ID: {COMPANY_ID}")
                print("✅ Get companies test passed")
                return True
            else:
                print(f"❌ Get companies test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get companies test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get companies test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get companies test failed: {str(e)}")
        return False

def test_create_company():
    """Test creating a new company"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN:
        print("❌ Create company test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing POST /api/companies...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        # Generate a unique company name
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        company_name = f"Test Company {timestamp}"
        
        payload = {
            "company_name": company_name,
            "legal_name": f"Test Legal Name {timestamp}",
            "tax_id": "12-3456789",
            "address_line1": "123 Test Street",
            "address_line2": "Suite 456",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "country": "Test Country",
            "phone": "123-456-7890",
            "email": f"test{timestamp}@example.com",
            "website": "https://example.com",
            "industry": "Technology",
            "business_type": "llc",
            "date_format": "MM/DD/YYYY",
            "currency": "USD"
        }
        
        response = requests.post(f"{API_URL}/companies", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "company_id" in data and data["company_name"] == company_name:
                COMPANY_ID = data["company_id"]
                print(f"Created company ID: {COMPANY_ID}")
                print("✅ Create company test passed")
                return True
            else:
                print(f"❌ Create company test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create company test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Create company test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Create company test failed: {str(e)}")
        return False

def test_get_company_by_id():
    """Test getting a specific company by ID"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get company by ID test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{COMPANY_ID}...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "company_id" in data and data["company_id"] == COMPANY_ID:
                print("✅ Get company by ID test passed")
                return True
            else:
                print(f"❌ Get company by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get company by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get company by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get company by ID test failed: {str(e)}")
        return False

def test_update_company():
    """Test updating a company"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Update company test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing PUT /api/companies/{COMPANY_ID}...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        # Generate updated data
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        updated_name = f"Updated Company {timestamp}"
        
        payload = {
            "company_name": updated_name,
            "phone": "987-654-3210",
            "website": "https://updated-example.com"
        }
        
        response = requests.put(f"{API_URL}/companies/{COMPANY_ID}", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "company_id" in data and data["company_id"] == COMPANY_ID and data["company_name"] == updated_name:
                print("✅ Update company test passed")
                return True
            else:
                print(f"❌ Update company test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update company test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update company test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update company test failed: {str(e)}")
        return False

def test_get_company_settings():
    """Test getting company settings"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get company settings test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{COMPANY_ID}/settings...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/settings", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                print("✅ Get company settings test passed")
                return True
            else:
                print(f"❌ Get company settings test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get company settings test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get company settings test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get company settings test failed: {str(e)}")
        return False

def test_get_company_settings_by_category():
    """Test getting company settings by category"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get company settings by category test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{COMPANY_ID}/settings/preferences...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/settings/preferences", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                # Check if all settings are from the preferences category
                all_preferences = all(item.get("category") == "preferences" for item in data)
                if all_preferences:
                    print("✅ Get company settings by category test passed")
                    return True
                else:
                    print(f"❌ Get company settings by category test failed: Not all settings are from preferences category")
                    return False
            else:
                print(f"❌ Get company settings by category test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get company settings by category test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get company settings by category test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get company settings by category test failed: {str(e)}")
        return False

def test_update_company_settings():
    """Test updating company settings"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Update company settings test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing PUT /api/companies/{COMPANY_ID}/settings...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        payload = {
            "settings": [
                {
                    "category": "preferences",
                    "setting_key": "date_format",
                    "setting_value": {"value": "DD/MM/YYYY"}
                },
                {
                    "category": "preferences",
                    "setting_key": "time_format",
                    "setting_value": {"value": "24h"}
                }
            ]
        }
        
        response = requests.put(f"{API_URL}/companies/{COMPANY_ID}/settings", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list) and len(data) == 2:
                # Verify the settings were updated
                date_format_updated = any(
                    item.get("category") == "preferences" and 
                    item.get("setting_key") == "date_format" and 
                    item.get("setting_value", {}).get("value") == "DD/MM/YYYY" 
                    for item in data
                )
                
                time_format_updated = any(
                    item.get("category") == "preferences" and 
                    item.get("setting_key") == "time_format" and 
                    item.get("setting_value", {}).get("value") == "24h" 
                    for item in data
                )
                
                if date_format_updated and time_format_updated:
                    print("✅ Update company settings test passed")
                    return True
                else:
                    print(f"❌ Update company settings test failed: Settings not updated correctly")
                    return False
            else:
                print(f"❌ Update company settings test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Update company settings test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update company settings test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update company settings test failed: {str(e)}")
        return False

def test_get_company_files():
    """Test getting company files"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get company files test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{COMPANY_ID}/files...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/files", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                print("✅ Get company files test passed")
                return True
            else:
                print(f"❌ Get company files test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get company files test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get company files test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get company files test failed: {str(e)}")
        return False

def test_upload_company_file():
    """Test uploading a company file"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Upload company file test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing POST /api/companies/{COMPANY_ID}/files...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        # Create a test file
        file_content = b"This is a test file content"
        test_file = io.BytesIO(file_content)
        
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"test_file_{timestamp}.txt"
        
        files = {
            "file": (filename, test_file, "text/plain")
        }
        
        response = requests.post(f"{API_URL}/companies/{COMPANY_ID}/files", headers=headers, files=files, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "attachment_id" in data and data["file_name"] == filename:
                print("✅ Upload company file test passed")
                return True
            else:
                print(f"❌ Upload company file test failed: Unexpected response")
                return False
        else:
            print(f"❌ Upload company file test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Upload company file test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Upload company file test failed: {str(e)}")
        return False

def test_get_company_users():
    """Test getting company users"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get company users test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{COMPANY_ID}/users...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/users", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                print("✅ Get company users test passed")
                return True
            else:
                print(f"❌ Get company users test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get company users test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get company users test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get company users test failed: {str(e)}")
        return False

def test_invite_company_user():
    """Test inviting a user to a company"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Invite company user test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing POST /api/companies/{COMPANY_ID}/users/invite...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        # Generate a unique email
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        email = f"invite_test_{timestamp}@example.com"
        
        payload = {
            "email": email,
            "role": "employee",
            "permissions": {"view": True, "edit": False}
        }
        
        response = requests.post(f"{API_URL}/companies/{COMPANY_ID}/users/invite", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and email in data["message"]:
                print("✅ Invite company user test passed")
                return True
            else:
                print(f"❌ Invite company user test failed: Unexpected response")
                return False
        else:
            print(f"❌ Invite company user test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invite company user test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invite company user test failed: {str(e)}")
        return False

def test_unauthorized_access():
    """Test accessing a company without authentication"""
    global COMPANY_ID
    
    if not COMPANY_ID:
        print("❌ Unauthorized access test skipped: No company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing unauthorized access to GET /api/companies/{COMPANY_ID}...")
        
        # No authorization header
        response = requests.get(f"{API_URL}/companies/{COMPANY_ID}", timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 401:
            print("✅ Unauthorized access test passed")
            return True
        else:
            print(f"❌ Unauthorized access test failed: Expected 401, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Unauthorized access test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Unauthorized access test failed: {str(e)}")
        return False

def test_delete_company():
    """Test deleting a company"""
    global ACCESS_TOKEN, COMPANY_ID, TOKEN_TYPE
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Delete company test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing DELETE /api/companies/{COMPANY_ID}...")
        headers = {"Authorization": f"{TOKEN_TYPE} {ACCESS_TOKEN}"}
        
        response = requests.delete(f"{API_URL}/companies/{COMPANY_ID}", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and "deleted" in data["message"].lower():
                print("✅ Delete company test passed")
                return True
            else:
                print(f"❌ Delete company test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete company test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete company test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete company test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all company management API tests"""
    print("\n🔍 Starting QuickBooks Clone Company Management API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {}
    
    # Authentication
    results["login_demo_user"] = test_login_demo_user()
    
    if results["login_demo_user"]:
        # Company Management API Endpoints
        results["get_companies"] = test_get_companies()
        results["create_company"] = test_create_company()
        
        if results["create_company"]:
            results["get_company_by_id"] = test_get_company_by_id()
            results["update_company"] = test_update_company()
            
            # Company Settings API Endpoints
            results["get_company_settings"] = test_get_company_settings()
            results["get_company_settings_by_category"] = test_get_company_settings_by_category()
            results["update_company_settings"] = test_update_company_settings()
            
            # Company File Management
            results["get_company_files"] = test_get_company_files()
            results["upload_company_file"] = test_upload_company_file()
            
            # Company User Management
            results["get_company_users"] = test_get_company_users()
            results["invite_company_user"] = test_invite_company_user()
            
            # Security Tests
            results["unauthorized_access"] = test_unauthorized_access()
            
            # Delete the test company at the end
            results["delete_company"] = test_delete_company()
    
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
    success = run_all_tests()
    sys.exit(0 if success else 1)