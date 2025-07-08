#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import decimal
from typing import Dict, Any, Optional, Tuple, List
import io
import urllib3

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

# ===== VENDORS API TESTS =====

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

def test_get_vendors():
    """Test getting vendors"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get vendors test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get vendors...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "vendor_name",
            "sort_order": "asc"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
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
                print(f"✅ Get vendors test passed (Found {data['total']} vendors)")
                return True
            else:
                print(f"❌ Get vendors test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendors test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendors test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendors test failed: {str(e)}")
        return False

def test_get_vendor_by_id(vendor_id):
    """Test getting a vendor by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Get vendor by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get vendor by ID: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
            if "vendor_id" in data and data["vendor_id"] == vendor_id:
                print("✅ Get vendor by ID test passed")
                return True
            else:
                print(f"❌ Get vendor by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendor by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendor by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendor by ID test failed: {str(e)}")
        return False

def test_update_vendor(vendor_id):
    """Test updating a vendor"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Update vendor test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update vendor: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated vendor data
        payload = {
            "vendor_name": f"Updated Vendor {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "555-111-2222",
            "address_line1": "456 Updated Vendor St"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
            if "vendor_id" in data and data["vendor_id"] == vendor_id and data["vendor_name"] == payload["vendor_name"]:
                print("✅ Update vendor test passed")
                return True
            else:
                print(f"❌ Update vendor test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update vendor test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update vendor test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update vendor test failed: {str(e)}")
        return False

def test_delete_vendor(vendor_id):
    """Test deleting a vendor (soft delete)"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Delete vendor test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete vendor: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
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
                print("✅ Delete vendor test passed")
                return True
            else:
                print(f"❌ Delete vendor test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete vendor test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete vendor test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete vendor test failed: {str(e)}")
        return False

def test_get_vendor_transactions(vendor_id):
    """Test getting vendor transactions"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not vendor_id:
        print("❌ Get vendor transactions test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get vendor transactions: {vendor_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}/transactions", 
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
            if "transactions" in data:
                print("✅ Get vendor transactions test passed")
                return True
            else:
                print(f"❌ Get vendor transactions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendor transactions test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get vendor transactions test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get vendor transactions test failed: {str(e)}")
        return False

def test_vendor_search_filtering():
    """Test vendor search and filtering capabilities"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Vendor search and filtering test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing vendor search and filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test 1: Search by vendor name
        print("\n  Test 1: Search by vendor name")
        params = {
            "search": "Test",
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} vendors matching search term 'Test'")
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 2: Filter by vendor type
        print("\n  Test 2: Filter by vendor type")
        params = {
            "vendor_type": "supplier",
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} vendors with type 'supplier'")
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 3: Filter by 1099 eligibility
        print("\n  Test 3: Filter by 1099 eligibility")
        params = {
            "eligible_1099": True,
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} vendors eligible for 1099")
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 4: Filter by active status
        print("\n  Test 4: Filter by active status")
        params = {
            "is_active": True,
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} active vendors")
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 5: Combination of multiple filters
        print("\n  Test 5: Combination of multiple filters")
        params = {
            "vendor_type": "supplier",
            "eligible_1099": True,
            "is_active": True,
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} active suppliers eligible for 1099")
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 6: Sorting
        print("\n  Test 6: Sorting")
        params = {
            "sort_by": "vendor_name",
            "sort_order": "desc",
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Found {data.get('total', 0)} vendors sorted by name in descending order")
        except:
            print(f"  Response: {response.text}")
            return False
        
        print("✅ Vendor search and filtering test passed")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Vendor search and filtering test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Vendor search and filtering test failed: {str(e)}")
        return False

def test_vendor_error_handling():
    """Test vendor API error handling"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Vendor error handling test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing vendor API error handling...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test 1: Invalid vendor ID
        print("\n  Test 1: Invalid vendor ID")
        invalid_vendor_id = "invalid-vendor-id"
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{invalid_vendor_id}", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Response: {pretty_print_json(data)}")
            if response.status_code == 404:
                print("  ✅ Correctly returned 404 for invalid vendor ID")
            else:
                print(f"  ❌ Expected 404 status code, got {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 2: Invalid company ID
        print("\n  Test 2: Invalid company ID")
        invalid_company_id = "invalid-company-id"
        
        response = requests.get(
            f"{API_URL}/companies/{invalid_company_id}/vendors/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Response: {pretty_print_json(data)}")
            if response.status_code == 403 or response.status_code == 404:
                print(f"  ✅ Correctly returned {response.status_code} for invalid company ID")
            else:
                print(f"  ❌ Expected 403 or 404 status code, got {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test 3: Invalid vendor data
        print("\n  Test 3: Invalid vendor data")
        
        # Empty vendor name (required field)
        payload = {
            "vendor_name": "",  # Empty name should fail validation
            "company_name": "Test Company Inc.",
            "vendor_type": "supplier"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            json=payload, 
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Response: {pretty_print_json(data)}")
            if response.status_code == 422:
                print("  ✅ Correctly returned 422 for invalid vendor data")
            else:
                print(f"  ❌ Expected 422 status code, got {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        print("✅ Vendor error handling test passed")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Vendor error handling test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Vendor error handling test failed: {str(e)}")
        return False

def test_vendor_pagination():
    """Test vendor pagination"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Vendor pagination test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing vendor pagination...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Create multiple vendors for pagination testing
        vendor_ids = []
        for i in range(3):
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S") + str(i)
            
            payload = {
                "vendor_name": f"Pagination Test Vendor {timestamp}",
                "company_name": "Pagination Test Inc.",
                "vendor_type": "supplier",
                "email": f"pagination.test.{timestamp}@example.com"
            }
            
            response = requests.post(
                f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
                headers=headers, 
                json=payload, 
                timeout=TIMEOUT
            )
            
            if response.status_code == 201:
                data = response.json()
                vendor_ids.append(data["vendor_id"])
                print(f"  Created test vendor {i+1}: {data['vendor_id']}")
            else:
                print(f"  Failed to create test vendor {i+1}: {response.status_code}")
        
        # Test pagination with different page sizes
        print("\n  Testing pagination with page size = 2")
        params = {
            "page": 1,
            "page_size": 2
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            if response.status_code == 200:
                print(f"  Page 1 contains {len(data['items'])} vendors")
                print(f"  Total vendors: {data['total']}")
                print(f"  Total pages: {data['total_pages']}")
                
                if len(data['items']) <= 2:
                    print("  ✅ Correctly limited results to page size")
                else:
                    print("  ❌ Page size limit not working correctly")
                    return False
                
                # Test second page if available
                if data['total_pages'] > 1:
                    print("\n  Testing pagination with page = 2")
                    params = {
                        "page": 2,
                        "page_size": 2
                    }
                    
                    response = requests.get(
                        f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
                        headers=headers, 
                        params=params,
                        timeout=TIMEOUT
                    )
                    
                    if response.status_code == 200:
                        page2_data = response.json()
                        print(f"  Page 2 contains {len(page2_data['items'])} vendors")
                        
                        # Check that page 2 returns different vendors than page 1
                        page1_ids = [item['vendor_id'] for item in data['items']]
                        page2_ids = [item['vendor_id'] for item in page2_data['items']]
                        
                        if set(page1_ids).intersection(set(page2_ids)):
                            print("  ❌ Found duplicate vendors across pages")
                            return False
                        else:
                            print("  ✅ Pages contain different vendors as expected")
                    else:
                        print(f"  ❌ Failed to get page 2: {response.status_code}")
                        return False
            else:
                print(f"  ❌ Pagination request failed: {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Clean up test vendors
        print("\n  Cleaning up test vendors...")
        for vendor_id in vendor_ids:
            response = requests.delete(
                f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
                headers=headers, 
                timeout=TIMEOUT
            )
            if response.status_code == 200:
                print(f"  Deleted test vendor: {vendor_id}")
            else:
                print(f"  Failed to delete test vendor {vendor_id}: {response.status_code}")
        
        print("✅ Vendor pagination test passed")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Vendor pagination test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Vendor pagination test failed: {str(e)}")
        return False

def test_vendor_authentication():
    """Test vendor API authentication requirements"""
    global COMPANY_ID
    
    if not COMPANY_ID:
        print("❌ Vendor authentication test skipped: No company ID available")
        return False
    
    try:
        print("\n🔍 Testing vendor API authentication requirements...")
        
        # Test without authentication header
        print("\n  Test without authentication header")
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Response: {pretty_print_json(data)}")
            if response.status_code == 401 or response.status_code == 403:
                print(f"  ✅ Correctly returned {response.status_code} for missing authentication")
            else:
                print(f"  ❌ Expected 401 or 403 status code, got {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        # Test with invalid token
        print("\n  Test with invalid token")
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers,
            timeout=TIMEOUT
        )
        print(f"  Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"  Response: {pretty_print_json(data)}")
            if response.status_code == 401 or response.status_code == 403:
                print(f"  ✅ Correctly returned {response.status_code} for invalid token")
            else:
                print(f"  ❌ Expected 401 or 403 status code, got {response.status_code}")
                return False
        except:
            print(f"  Response: {response.text}")
            return False
        
        print("✅ Vendor authentication test passed")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Vendor authentication test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Vendor authentication test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Run tests
    print("\n🔍 Starting QuickBooks Clone Vendor Management API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Basic API tests
    test_root_endpoint()
    test_health_endpoint()
    
    # Authentication tests
    if test_login_demo_user():
        test_get_user_companies()
        test_company_access()
        
        # Vendor tests
        success, vendor_id = test_create_vendor()
        if success:
            test_get_vendors()
            test_get_vendor_by_id(vendor_id)
            test_update_vendor(vendor_id)
            test_get_vendor_transactions(vendor_id)
            
            # Additional vendor tests
            test_vendor_search_filtering()
            test_vendor_error_handling()
            test_vendor_pagination()
            test_vendor_authentication()
            
            test_delete_vendor(vendor_id)
    
    print("\n✅ Vendor Management API tests completed.")
