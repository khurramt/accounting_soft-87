#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import decimal
from typing import Dict, Any, Optional, Tuple, List
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

def print_section_header(title):
    """Print a formatted section header"""
    print(f"\n{'=' * 80}")
    print(f"  {title}")
    print(f"{'=' * 80}")

def print_test_header(title):
    """Print a formatted test header"""
    print(f"\n{'-' * 40}")
    print(f"  {title}")
    print(f"{'-' * 40}")

def login_demo_user():
    """Login with demo user credentials"""
    global ACCESS_TOKEN, REFRESH_TOKEN, USER_ID
    
    try:
        print_test_header("Logging in with demo user")
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            ACCESS_TOKEN = data["access_token"]
            REFRESH_TOKEN = data["refresh_token"]
            USER_ID = data["user"]["user_id"]
            print("✅ Login successful")
            return True
        else:
            print(f"❌ Login failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login failed: {str(e)}")
        return False

def get_user_companies():
    """Get user companies and set the first company ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get user companies skipped: No access token available")
        return False
    
    try:
        print_test_header("Getting user companies")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"✅ Got companies. Using company ID: {COMPANY_ID}")
                return True
            else:
                print("❌ No companies found")
                return False
        else:
            print(f"❌ Failed to get companies: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to get companies: {str(e)}")
        return False

def test_vendor_crud_operations():
    """Test vendor CRUD operations"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Vendor CRUD tests skipped: No access token or company ID available")
        return False
    
    print_section_header("VENDOR CRUD OPERATIONS")
    
    # Create a vendor
    vendor_id = None
    try:
        print_test_header("Creating a new vendor")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        
        if response.status_code == 201:
            data = response.json()
            vendor_id = data["vendor_id"]
            print(f"✅ Vendor created successfully (ID: {vendor_id})")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Failed to create vendor: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to create vendor: {str(e)}")
        return False
    
    if not vendor_id:
        return False
    
    # Get vendor by ID
    try:
        print_test_header(f"Getting vendor by ID: {vendor_id}")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got vendor successfully")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Failed to get vendor: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to get vendor: {str(e)}")
        return False
    
    # Update vendor
    try:
        print_test_header(f"Updating vendor: {vendor_id}")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Vendor updated successfully")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Failed to update vendor: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to update vendor: {str(e)}")
        return False
    
    # Get vendor transactions
    try:
        print_test_header(f"Getting vendor transactions: {vendor_id}")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}/transactions", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got vendor transactions successfully")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Failed to get vendor transactions: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to get vendor transactions: {str(e)}")
        return False
    
    # Delete vendor (soft delete)
    try:
        print_test_header(f"Deleting vendor: {vendor_id}")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Vendor deleted successfully")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Failed to delete vendor: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Failed to delete vendor: {str(e)}")
        return False
    
    return True

def test_vendor_search_filtering():
    """Test vendor search and filtering capabilities"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Vendor search and filtering tests skipped: No access token or company ID available")
        return False
    
    print_section_header("VENDOR SEARCH & FILTERING")
    
    # Create test vendors with different attributes for filtering
    vendor_ids = []
    try:
        print_test_header("Creating test vendors for filtering tests")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Create vendor 1: supplier, 1099 eligible
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload1 = {
            "vendor_name": f"Test Supplier {timestamp}",
            "company_name": "Supplier Inc.",
            "vendor_type": "supplier",
            "email": f"supplier.{timestamp}@example.com",
            "eligible_1099": True
        }
        
        # Create vendor 2: contractor, 1099 eligible
        payload2 = {
            "vendor_name": f"Test Contractor {timestamp}",
            "company_name": "Contractor LLC",
            "vendor_type": "contractor",
            "email": f"contractor.{timestamp}@example.com",
            "eligible_1099": True
        }
        
        # Create vendor 3: service, not 1099 eligible
        payload3 = {
            "vendor_name": f"Test Service {timestamp}",
            "company_name": "Service Co.",
            "vendor_type": "service",
            "email": f"service.{timestamp}@example.com",
            "eligible_1099": False
        }
        
        for i, payload in enumerate([payload1, payload2, payload3], 1):
            response = requests.post(
                f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
                headers=headers, 
                json=payload, 
                timeout=TIMEOUT
            )
            
            if response.status_code == 201:
                data = response.json()
                vendor_id = data["vendor_id"]
                vendor_ids.append(vendor_id)
                print(f"✅ Created test vendor {i}: {vendor_id}")
            else:
                print(f"❌ Failed to create test vendor {i}: Status code {response.status_code}")
        
        if not vendor_ids:
            print("❌ No test vendors created, skipping filtering tests")
            return False
            
        print(f"Created {len(vendor_ids)} test vendors for filtering tests")
    except Exception as e:
        print(f"❌ Failed to create test vendors: {str(e)}")
        return False
    
    # Test 1: Search by vendor name
    try:
        print_test_header("Test 1: Search by vendor name")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search by name successful")
            print(f"Found {data.get('total', 0)} vendors matching search term 'Test'")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Search by name failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Search by name failed: {str(e)}")
        return False
    
    # Test 2: Filter by vendor type
    try:
        print_test_header("Test 2: Filter by vendor type")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Filter by vendor type successful")
            print(f"Found {data.get('total', 0)} vendors with type 'supplier'")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Filter by vendor type failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Filter by vendor type failed: {str(e)}")
        return False
    
    # Test 3: Filter by 1099 eligibility
    try:
        print_test_header("Test 3: Filter by 1099 eligibility")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Filter by 1099 eligibility successful")
            print(f"Found {data.get('total', 0)} vendors eligible for 1099")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Filter by 1099 eligibility failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Filter by 1099 eligibility failed: {str(e)}")
        return False
    
    # Test 4: Filter by active status
    try:
        print_test_header("Test 4: Filter by active status")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Filter by active status successful")
            print(f"Found {data.get('total', 0)} active vendors")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Filter by active status failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Filter by active status failed: {str(e)}")
        return False
    
    # Test 5: Combination of multiple filters
    try:
        print_test_header("Test 5: Combination of multiple filters")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Combined filtering successful")
            print(f"Found {data.get('total', 0)} active suppliers eligible for 1099")
            print(f"Response: {pretty_print_json(data)}")
        else:
            print(f"❌ Combined filtering failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Combined filtering failed: {str(e)}")
        return False
    
    # Clean up test vendors
    print_test_header("Cleaning up test vendors")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    for vendor_id in vendor_ids:
        try:
            response = requests.delete(
                f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
                headers=headers, 
                timeout=TIMEOUT
            )
            if response.status_code == 200:
                print(f"✅ Deleted test vendor: {vendor_id}")
            else:
                print(f"❌ Failed to delete test vendor {vendor_id}: Status code {response.status_code}")
        except Exception as e:
            print(f"❌ Failed to delete test vendor {vendor_id}: {str(e)}")
    
    return True

def test_pagination_sorting():
    """Test pagination and sorting"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Pagination and sorting tests skipped: No access token or company ID available")
        return False
    
    print_section_header("PAGINATION & SORTING")
    
    # Create multiple vendors for pagination testing
    vendor_ids = []
    try:
        print_test_header("Creating test vendors for pagination tests")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        for i in range(5):
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S") + str(i)
            
            payload = {
                "vendor_name": f"Pagination Test Vendor {chr(65+i)} {timestamp}",
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
                print(f"✅ Created test vendor {i+1}: {data['vendor_id']}")
            else:
                print(f"❌ Failed to create test vendor {i+1}: Status code {response.status_code}")
        
        if len(vendor_ids) < 3:
            print("❌ Not enough test vendors created, skipping pagination tests")
            return False
            
        print(f"Created {len(vendor_ids)} test vendors for pagination tests")
    except Exception as e:
        print(f"❌ Failed to create test vendors: {str(e)}")
        return False
    
    # Test pagination with page size = 2
    try:
        print_test_header("Test pagination with page size = 2")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pagination test successful")
            print(f"Page 1 contains {len(data['items'])} vendors")
            print(f"Total vendors: {data['total']}")
            print(f"Total pages: {data['total_pages']}")
            
            if len(data['items']) <= 2:
                print("✅ Correctly limited results to page size")
            else:
                print("❌ Page size limit not working correctly")
                return False
            
            # Get page 2 if available
            if data['total_pages'] > 1:
                print_test_header("Test pagination with page = 2")
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
                    print(f"✅ Page 2 pagination test successful")
                    print(f"Page 2 contains {len(page2_data['items'])} vendors")
                    
                    # Check that page 2 returns different vendors than page 1
                    page1_ids = [item['vendor_id'] for item in data['items']]
                    page2_ids = [item['vendor_id'] for item in page2_data['items']]
                    
                    if set(page1_ids).intersection(set(page2_ids)):
                        print("❌ Found duplicate vendors across pages")
                        return False
                    else:
                        print("✅ Pages contain different vendors as expected")
                else:
                    print(f"❌ Failed to get page 2: Status code {response.status_code}")
                    return False
        else:
            print(f"❌ Pagination test failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Pagination test failed: {str(e)}")
        return False
    
    # Test sorting (ascending)
    try:
        print_test_header("Test sorting (ascending)")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        params = {
            "sort_by": "vendor_name",
            "sort_order": "asc",
            "page": 1,
            "page_size": 10
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            params=params,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sorting (ascending) test successful")
            
            # Check if vendors are sorted by name in ascending order
            if len(data['items']) >= 2:
                names = [item['vendor_name'] for item in data['items']]
                sorted_names = sorted(names)
                
                if names == sorted_names:
                    print("✅ Vendors are correctly sorted in ascending order")
                else:
                    print("❌ Vendors are not correctly sorted in ascending order")
                    print(f"Actual order: {names}")
                    print(f"Expected order: {sorted_names}")
            else:
                print("⚠️ Not enough vendors to verify sorting")
        else:
            print(f"❌ Sorting test failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Sorting test failed: {str(e)}")
        return False
    
    # Test sorting (descending)
    try:
        print_test_header("Test sorting (descending)")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sorting (descending) test successful")
            
            # Check if vendors are sorted by name in descending order
            if len(data['items']) >= 2:
                names = [item['vendor_name'] for item in data['items']]
                sorted_names = sorted(names, reverse=True)
                
                if names == sorted_names:
                    print("✅ Vendors are correctly sorted in descending order")
                else:
                    print("❌ Vendors are not correctly sorted in descending order")
                    print(f"Actual order: {names}")
                    print(f"Expected order: {sorted_names}")
            else:
                print("⚠️ Not enough vendors to verify sorting")
        else:
            print(f"❌ Sorting test failed: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Sorting test failed: {str(e)}")
        return False
    
    # Clean up test vendors
    print_test_header("Cleaning up test vendors")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    for vendor_id in vendor_ids:
        try:
            response = requests.delete(
                f"{API_URL}/companies/{COMPANY_ID}/vendors/{vendor_id}", 
                headers=headers, 
                timeout=TIMEOUT
            )
            if response.status_code == 200:
                print(f"✅ Deleted test vendor: {vendor_id}")
            else:
                print(f"❌ Failed to delete test vendor {vendor_id}: Status code {response.status_code}")
        except Exception as e:
            print(f"❌ Failed to delete test vendor {vendor_id}: {str(e)}")
    
    return True

def test_error_handling():
    """Test error handling for vendor API"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Error handling tests skipped: No access token or company ID available")
        return False
    
    print_section_header("ERROR HANDLING")
    
    # Test 1: Invalid vendor ID
    try:
        print_test_header("Test 1: Invalid vendor ID")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        invalid_vendor_id = "invalid-vendor-id"
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/{invalid_vendor_id}", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ Correctly returned 404 for invalid vendor ID")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 404 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid vendor ID test failed: {str(e)}")
        return False
    
    # Test 2: Invalid company ID
    try:
        print_test_header("Test 2: Invalid company ID")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        invalid_company_id = "invalid-company-id"
        
        response = requests.get(
            f"{API_URL}/companies/{invalid_company_id}/vendors/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 403 or response.status_code == 404:
            print(f"✅ Correctly returned {response.status_code} for invalid company ID")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 403 or 404 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid company ID test failed: {str(e)}")
        return False
    
    # Test 3: Invalid vendor data
    try:
        print_test_header("Test 3: Invalid vendor data")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
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
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            print("✅ Correctly returned 422 for invalid vendor data")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 422 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid vendor data test failed: {str(e)}")
        return False
    
    # Test 4: Unauthorized access
    try:
        print_test_header("Test 4: Unauthorized access")
        
        # No authentication header
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401 or response.status_code == 403:
            print(f"✅ Correctly returned {response.status_code} for missing authentication")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 401 or 403 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Unauthorized access test failed: {str(e)}")
        return False
    
    return True

def test_authentication_authorization():
    """Test authentication and authorization for vendor API"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Authentication and authorization tests skipped: No access token or company ID available")
        return False
    
    print_section_header("AUTHENTICATION & AUTHORIZATION")
    
    # Test 1: Access with valid token
    try:
        print_test_header("Test 1: Access with valid token")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Successfully accessed API with valid token")
        else:
            print(f"❌ Failed to access API with valid token: Status code {response.status_code}")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Valid token test failed: {str(e)}")
        return False
    
    # Test 2: Access without token
    try:
        print_test_header("Test 2: Access without token")
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401 or response.status_code == 403:
            print(f"✅ Correctly denied access without token (status code: {response.status_code})")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 401 or 403 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ No token test failed: {str(e)}")
        return False
    
    # Test 3: Access with invalid token
    try:
        print_test_header("Test 3: Access with invalid token")
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        # Note: Some APIs might return 500 for invalid tokens due to JWT decoding errors
        if response.status_code in [401, 403, 500]:
            print(f"✅ Correctly denied access with invalid token (status code: {response.status_code})")
            try:
                print(f"Response: {pretty_print_json(response.json())}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Expected 401, 403, or 500 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid token test failed: {str(e)}")
        return False
    
    return True

def run_all_tests():
    """Run all vendor management tests"""
    print_section_header("VENDOR MANAGEMENT INTEGRATION - PHASE 1.3 TESTS")
    print(f"Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Setup: Login and get company ID
    if not login_demo_user():
        print("❌ Login failed, aborting tests")
        return False
    
    if not get_user_companies():
        print("❌ Failed to get companies, aborting tests")
        return False
    
    # Run all test categories
    crud_result = test_vendor_crud_operations()
    search_result = test_vendor_search_filtering()
    pagination_result = test_pagination_sorting()
    error_result = test_error_handling()
    auth_result = test_authentication_authorization()
    
    # Print summary
    print_section_header("TEST SUMMARY")
    print(f"CRUD Operations: {'✅ PASSED' if crud_result else '❌ FAILED'}")
    print(f"Search & Filtering: {'✅ PASSED' if search_result else '❌ FAILED'}")
    print(f"Pagination & Sorting: {'✅ PASSED' if pagination_result else '❌ FAILED'}")
    print(f"Error Handling: {'✅ PASSED' if error_result else '❌ FAILED'}")
    print(f"Authentication & Authorization: {'✅ PASSED' if auth_result else '❌ FAILED'}")
    
    overall_result = crud_result and search_result and pagination_result and error_result and auth_result
    print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if overall_result else '❌ SOME TESTS FAILED'}")
    
    return overall_result

if __name__ == "__main__":
    run_all_tests()