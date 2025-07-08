#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime
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

# Global variables to store auth tokens and IDs
ACCESS_TOKEN = None
REFRESH_TOKEN = None
USER_ID = None
COMPANY_ID = None

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2)

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

def test_token_refresh():
    """Test token refresh functionality"""
    global ACCESS_TOKEN, REFRESH_TOKEN
    
    if not REFRESH_TOKEN:
        print("❌ Token refresh test skipped: No refresh token available")
        return False
    
    try:
        print("\n🔍 Testing token refresh...")
        payload = {
            "refresh_token": REFRESH_TOKEN
        }
        
        response = requests.post(f"{API_URL}/auth/refresh-token", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "access_token" in data and "refresh_token" in data:
                # Update tokens
                ACCESS_TOKEN = data["access_token"]
                REFRESH_TOKEN = data["refresh_token"]
                print("✅ Token refresh test passed")
                return True
            else:
                print(f"❌ Token refresh test failed: Unexpected response")
                return False
        else:
            print(f"❌ Token refresh test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Token refresh test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Token refresh test failed: {str(e)}")
        return False

def test_get_companies():
    """Test getting companies for authenticated user"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get companies test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing GET /api/companies...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/companies", headers=headers, timeout=TIMEOUT)
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
                    if "id" in data[0]:
                        COMPANY_ID = data[0]["id"]
                    elif "company_id" in data[0]:
                        COMPANY_ID = data[0]["company_id"]
                    print(f"Using company ID: {COMPANY_ID}")
                print(f"✅ Get companies test passed (Found {len(data)} companies)")
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
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Create company test skipped: No access token available")
        return False, None
    
    try:
        print("\n🔍 Testing POST /api/companies...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique company name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "name": f"Test Company {timestamp}",
            "legal_name": f"Test Legal Name {timestamp}",
            "industry": "Technology",
            "business_type": "LLC",
            "company_size": "1-5 employees",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "phone": "555-123-4567",
            "email": f"test.company.{timestamp}@example.com",
            "website": "https://testcompany.example.com",
            "tax_id": "12-3456789",
            "fiscal_year_start": "01",
            "account_template": "standard",
            "settings": {
                "import_customers": False,
                "import_vendors": False,
                "import_items": False,
                "import_employees": False
            }
        }
        
        response = requests.post(
            f"{API_URL}/companies", 
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
        
        if response.status_code == 200 or response.status_code == 201:
            company_id = None
            if "id" in data:
                company_id = data["id"]
            elif "company_id" in data:
                company_id = data["company_id"]
                
            if company_id:
                print(f"✅ Create company test passed (ID: {company_id})")
                return True, company_id
            else:
                print(f"❌ Create company test failed: No company ID in response")
                return False, None
        else:
            print(f"❌ Create company test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create company test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create company test failed: {str(e)}")
        return False, None

def test_get_company_by_id(company_id):
    """Test getting a specific company by ID"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Get company by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{company_id}", 
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
            id_field = "id" if "id" in data else "company_id"
            if id_field in data and data[id_field] == company_id:
                print("✅ Get company by ID test passed")
                return True
            else:
                print(f"❌ Get company by ID test failed: Company ID mismatch or missing")
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

def test_update_company(company_id):
    """Test updating a company"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Update company test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing PUT /api/companies/{company_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated company data
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "name": f"Updated Company {timestamp}",
            "phone": "555-987-6543",
            "website": "https://updated-company.example.com"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{company_id}", 
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
            name_field = "name"
            if name_field in data and data[name_field] == payload["name"]:
                print("✅ Update company test passed")
                return True
            else:
                print(f"❌ Update company test failed: Company name not updated or missing")
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

def test_delete_company(company_id):
    """Test deleting a company (soft delete)"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Delete company test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing DELETE /api/companies/{company_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{company_id}", 
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
            if "message" in data and ("deleted" in data["message"].lower() or "success" in data["message"].lower()):
                print("✅ Delete company test passed")
                return True
            else:
                print(f"❌ Delete company test failed: Unexpected response message")
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

def test_get_company_settings(company_id):
    """Test getting company settings"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Get company settings test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id}/settings...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{company_id}/settings", 
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
            if isinstance(data, list):
                print(f"✅ Get company settings test passed (Found {len(data)} settings)")
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

def test_update_company_settings(company_id):
    """Test updating company settings"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Update company settings test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing PUT /api/companies/{company_id}/settings...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated settings data
        payload = {
            "settings": [
                {
                    "category": "general",
                    "key": "default_currency",
                    "value": "USD"
                },
                {
                    "category": "general",
                    "key": "date_format",
                    "value": "MM/DD/YYYY"
                }
            ]
        }
        
        response = requests.put(
            f"{API_URL}/companies/{company_id}/settings", 
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
            if isinstance(data, list):
                print(f"✅ Update company settings test passed")
                return True
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

def test_get_company_settings_by_category(company_id):
    """Test getting company settings by category"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Get company settings by category test skipped: Missing required data")
        return False
    
    try:
        category = "general"
        print(f"\n🔍 Testing GET /api/companies/{company_id}/settings/{category}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{company_id}/settings/{category}", 
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
            if isinstance(data, list):
                print(f"✅ Get company settings by category test passed (Found {len(data)} settings)")
                return True
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

def test_get_company_files(company_id):
    """Test getting company files"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Get company files test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id}/files...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{company_id}/files", 
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
            if isinstance(data, list):
                print(f"✅ Get company files test passed (Found {len(data)} files)")
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

def test_upload_company_file(company_id):
    """Test uploading a company file"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Upload company file test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing POST /api/companies/{company_id}/files...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Create a test file
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        file_content = f"Test file content {timestamp}".encode('utf-8')
        file_obj = io.BytesIO(file_content)
        
        files = {
            'file': ('test_file.txt', file_obj, 'text/plain')
        }
        
        response = requests.post(
            f"{API_URL}/companies/{company_id}/files", 
            headers=headers, 
            files=files,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200 or response.status_code == 201:
            if "file_name" in data and data["file_name"] == "test_file.txt":
                print(f"✅ Upload company file test passed")
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

def test_get_company_users(company_id):
    """Test getting company users"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Get company users test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id}/users...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{company_id}/users", 
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
            if isinstance(data, list):
                print(f"✅ Get company users test passed (Found {len(data)} users)")
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

def test_invite_company_user(company_id):
    """Test inviting a user to a company"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Invite company user test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing POST /api/companies/{company_id}/users/invite...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Invite data
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "email": f"test.invite.{timestamp}@example.com",
            "role": "user",
            "permissions": ["view", "edit"]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{company_id}/users/invite", 
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
        
        if response.status_code == 200 or response.status_code == 201:
            if "message" in data and "invitation" in data["message"].lower():
                print(f"✅ Invite company user test passed")
                return True
            else:
                print(f"❌ Invite company user test failed: Unexpected response message")
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

def test_invalid_auth():
    """Test API with invalid authentication"""
    try:
        print("\n🔍 Testing API with invalid authentication...")
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = requests.get(f"{API_URL}/companies", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 401:
            print("✅ Invalid authentication test passed")
            return True
        else:
            print(f"❌ Invalid authentication test failed: Expected 401, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invalid authentication test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invalid authentication test failed: {str(e)}")
        return False

def run_company_management_tests():
    """Run all Company Management API tests"""
    print("\n🔍 Starting QuickBooks Clone Company Management API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {}
    
    # Login and get company access
    results["login_demo_user"] = test_login_demo_user()
    if not results["login_demo_user"]:
        print("❌ Login failed, skipping all other tests")
        return False
    
    # Test token refresh
    results["token_refresh"] = test_token_refresh()
    
    # Test invalid authentication
    results["invalid_auth"] = test_invalid_auth()
    
    # Test company management APIs
    results["get_companies"] = test_get_companies()
    
    # Create a new company for testing
    company_result, company_id = test_create_company()
    results["create_company"] = company_result
    
    if company_id:
        # Test company-specific endpoints
        results["get_company_by_id"] = test_get_company_by_id(company_id)
        results["update_company"] = test_update_company(company_id)
        results["get_company_settings"] = test_get_company_settings(company_id)
        results["update_company_settings"] = test_update_company_settings(company_id)
        results["get_company_settings_by_category"] = test_get_company_settings_by_category(company_id)
        results["get_company_files"] = test_get_company_files(company_id)
        results["upload_company_file"] = test_upload_company_file(company_id)
        results["get_company_users"] = test_get_company_users(company_id)
        results["invite_company_user"] = test_invite_company_user(company_id)
        
        # Clean up by deleting the test company
        results["delete_company"] = test_delete_company(company_id)
    
    # Print summary
    print("\n📋 Company Management API Test Summary:")
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    # Calculate success rate
    success_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    success_rate = (success_count / total_count) * 100 if total_count > 0 else 0
    
    print(f"\n🔍 Company Management API Tests: {success_count}/{total_count} passed ({success_rate:.1f}%)")
    
    return success_rate == 100

if __name__ == "__main__":
    run_company_management_tests()