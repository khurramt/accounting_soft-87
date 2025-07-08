#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import decimal
import urllib3
import subprocess

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

# Use the access token from the curl command
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjZjYzM1NjctMzk1My00NDQzLWE2Y2MtYzk3MGFlYjFlNTljIiwic2Vzc2lvbl9pZCI6IjFhMjk0MmI4LTMyN2UtNDdjYy05MWZiLTM2MGQ5Y2EyYzBhMCIsImV4cCI6MTc1MjAwNTU0MiwiaWF0IjoxNzUyMDA0NjQyLCJ0eXBlIjoiYWNjZXNzIn0.klzOEYqf8Sf9qCmhqN1rgc23ogQfexohSlASwALVqhA"

# Custom JSON encoder to handle decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2)

def run_curl_command(command):
    """Run a curl command and return the output"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        return None

def test_list_companies():
    """Test listing companies for authenticated user"""
    try:
        print("\n🔍 Testing GET /api/companies - List companies...")
        command = f'curl -k -s -H "Authorization: Bearer {ACCESS_TOKEN}" {API_URL}/companies/'
        response = run_curl_command(command)
        
        if not response:
            print("❌ List companies test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ List companies test failed: Invalid JSON response")
            return False
        
        if isinstance(data, list):
            print(f"✅ List companies test passed (Found {len(data)} companies)")
            return True
        else:
            print(f"❌ List companies test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ List companies test failed: {str(e)}")
        return False

def test_create_company():
    """Test creating a new company"""
    try:
        print("\n🔍 Testing POST /api/companies - Create company...")
        
        # Generate a unique company name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "company_name": f"Test Company {timestamp}",
            "company_type": "corporation",
            "industry": "technology",
            "address_line1": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "country": "US",
            "phone": "555-123-4567",
            "email": f"test.company.{timestamp}@example.com",
            "website": "https://example.com",
            "fiscal_year_start": "2025-01-01",
            "tax_year_start": "2025-01-01",
            "currency": "USD",
            "language": "en-US"
        }
        
        payload_json = json.dumps(payload)
        command = f'curl -k -s -X POST -H "Authorization: Bearer {ACCESS_TOKEN}" -H "Content-Type: application/json" -d \'{payload_json}\' {API_URL}/companies/'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Create company test failed: No response from API")
            return False, None
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Create company test failed: Invalid JSON response")
            return False, None
        
        if "company_id" in data and data.get("company_name") == payload["company_name"]:
            company_id = data["company_id"]
            print(f"✅ Create company test passed (ID: {company_id})")
            return True, company_id
        else:
            print(f"❌ Create company test failed: Unexpected response")
            return False, None
    except Exception as e:
        print(f"❌ Create company test failed: {str(e)}")
        return False, None

def test_get_company_by_id(company_id):
    """Test getting company details by ID"""
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id} - Get company details...")
        command = f'curl -k -s -H "Authorization: Bearer {ACCESS_TOKEN}" {API_URL}/companies/{company_id}'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Get company by ID test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Get company by ID test failed: Invalid JSON response")
            return False
        
        if "company_id" in data and data["company_id"] == company_id:
            print("✅ Get company by ID test passed")
            return True
        else:
            print(f"❌ Get company by ID test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ Get company by ID test failed: {str(e)}")
        return False

def test_update_company(company_id):
    """Test updating company information"""
    try:
        print(f"\n🔍 Testing PUT /api/companies/{company_id} - Update company...")
        
        # Updated company data
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "company_name": f"Updated Company {timestamp}",
            "phone": "555-987-6543",
            "address_line1": "456 Updated St",
            "website": "https://updated-example.com"
        }
        
        payload_json = json.dumps(payload)
        command = f'curl -k -s -X PUT -H "Authorization: Bearer {ACCESS_TOKEN}" -H "Content-Type: application/json" -d \'{payload_json}\' {API_URL}/companies/{company_id}'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Update company test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Update company test failed: Invalid JSON response")
            return False
        
        if "company_id" in data and data["company_id"] == company_id and data["company_name"] == payload["company_name"]:
            print("✅ Update company test passed")
            return True
        else:
            print(f"❌ Update company test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ Update company test failed: {str(e)}")
        return False

def test_get_company_settings(company_id):
    """Test getting company settings"""
    try:
        print(f"\n🔍 Testing GET /api/companies/{company_id}/settings - Get company settings...")
        command = f'curl -k -s -H "Authorization: Bearer {ACCESS_TOKEN}" {API_URL}/companies/{company_id}/settings'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Get company settings test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Get company settings test failed: Invalid JSON response")
            return False
        
        if isinstance(data, list):
            print("✅ Get company settings test passed")
            return True
        else:
            print(f"❌ Get company settings test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ Get company settings test failed: {str(e)}")
        return False

def test_update_company_settings(company_id):
    """Test updating company settings"""
    try:
        print(f"\n🔍 Testing PUT /api/companies/{company_id}/settings - Update company settings...")
        
        # Settings to update
        payload = {
            "settings": [
                {
                    "category": "general",
                    "setting_key": "default_currency",
                    "setting_value": {"value": "USD"}
                },
                {
                    "category": "general",
                    "setting_key": "default_language",
                    "setting_value": {"value": "en-US"}
                },
                {
                    "category": "invoicing",
                    "setting_key": "default_terms",
                    "setting_value": {"value": "Net 30"}
                }
            ]
        }
        
        payload_json = json.dumps(payload)
        command = f'curl -k -s -X PUT -H "Authorization: Bearer {ACCESS_TOKEN}" -H "Content-Type: application/json" -d \'{payload_json}\' {API_URL}/companies/{company_id}/settings'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Update company settings test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Update company settings test failed: Invalid JSON response")
            return False
        
        if isinstance(data, list):
            print("✅ Update company settings test passed")
            return True
        else:
            print(f"❌ Update company settings test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ Update company settings test failed: {str(e)}")
        return False

def test_delete_company(company_id):
    """Test deleting a company"""
    try:
        print(f"\n🔍 Testing DELETE /api/companies/{company_id} - Delete company...")
        command = f'curl -k -s -X DELETE -H "Authorization: Bearer {ACCESS_TOKEN}" {API_URL}/companies/{company_id}'
        response = run_curl_command(command)
        
        if not response:
            print("❌ Delete company test failed: No response from API")
            return False
        
        print(f"Response: {response}")
        
        try:
            data = json.loads(response)
        except:
            print("❌ Delete company test failed: Invalid JSON response")
            return False
        
        if "message" in data and "deleted" in data["message"].lower():
            print("✅ Delete company test passed")
            return True
        else:
            print(f"❌ Delete company test failed: Unexpected response")
            return False
    except Exception as e:
        print(f"❌ Delete company test failed: {str(e)}")
        return False

def run_company_management_tests():
    """Run all Company Management API tests"""
    print("\n🔍 Starting QuickBooks Clone Company Management API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {}
    
    # Test listing companies
    results["list_companies"] = test_list_companies()
    
    # Test creating a new company
    create_result, company_id = test_create_company()
    results["create_company"] = create_result
    
    if company_id:
        # Test getting company details
        results["get_company_by_id"] = test_get_company_by_id(company_id)
        
        # Test updating company
        results["update_company"] = test_update_company(company_id)
        
        # Test company settings
        results["get_company_settings"] = test_get_company_settings(company_id)
        results["update_company_settings"] = test_update_company_settings(company_id)
        
        # Test deleting company (do this last)
        results["delete_company"] = test_delete_company(company_id)
    else:
        print("❌ No company ID available, skipping company-specific tests")
    
    # Print summary
    print("\n📋 Company Management API Test Summary:")
    for test, result in results.items():
        status = "✅ Passed" if result else "❌ Failed"
        print(f"{test}: {status}")
    
    # Return overall success (all tests passed)
    return all(results.values())

if __name__ == "__main__":
    success = run_company_management_tests()
    sys.exit(0 if success else 1)