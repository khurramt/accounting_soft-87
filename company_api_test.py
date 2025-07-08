#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime
import io
import time

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

def run_company_management_tests():
    """Run comprehensive tests for company management API endpoints"""
    
    results = {}
    
    # Step 1: Login to get token
    print("\n🔍 Step 1: Login with demo user")
    login_payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    try:
        login_response = requests.post(f"{API_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        print(f"Status Code: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            results["login"] = False
            return results
        
        login_data = login_response.json()
        access_token = login_data["access_token"]
        token_type = login_data["token_type"]
        auth_header = {"Authorization": f"{token_type} {access_token}"}
        
        print(f"✅ Login successful, got token: {access_token[:10]}...")
        results["login"] = True
    except Exception as e:
        print(f"❌ Login failed with exception: {str(e)}")
        results["login"] = False
        return results
    
    # Step 2: Get user companies
    print("\n🔍 Step 2: Get user companies")
    try:
        companies_response = requests.get(f"{API_URL}/companies/", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {companies_response.status_code}")
        
        if companies_response.status_code != 200:
            print(f"❌ Get companies failed: {companies_response.text}")
            results["get_companies"] = False
        else:
            companies = companies_response.json()
            print(f"Found {len(companies)} companies")
            
            company_id = None
            if len(companies) > 0:
                company_id = companies[0]["company_id"]
                print(f"Using existing company ID: {company_id}")
            
            results["get_companies"] = True
    except Exception as e:
        print(f"❌ Get companies failed with exception: {str(e)}")
        results["get_companies"] = False
    
    # Step 3: Create a new company
    print("\n🔍 Step 3: Create a new company")
    try:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        company_name = f"Test Company {timestamp}"
        
        create_payload = {
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
        
        create_response = requests.post(f"{API_URL}/companies/", headers=auth_header, json=create_payload, timeout=TIMEOUT)
        print(f"Status Code: {create_response.status_code}")
        
        if create_response.status_code != 200:
            print(f"❌ Create company failed: {create_response.text}")
            results["create_company"] = False
            # If we couldn't create a company, use an existing one if available
            if company_id is None and len(companies) > 0:
                company_id = companies[0]["company_id"]
        else:
            company_data = create_response.json()
            company_id = company_data["company_id"]
            print(f"✅ Created company: {company_name} with ID: {company_id}")
            results["create_company"] = True
    except Exception as e:
        print(f"❌ Create company failed with exception: {str(e)}")
        results["create_company"] = False
        # If we couldn't create a company, use an existing one if available
        if company_id is None and len(companies) > 0:
            company_id = companies[0]["company_id"]
    
    # Skip remaining tests if we don't have a company ID
    if company_id is None:
        print("❌ Cannot proceed with tests: No company ID available")
        return results
    
    # Step 4: Get company by ID
    print(f"\n🔍 Step 4: Get company by ID {company_id}")
    try:
        get_company_response = requests.get(f"{API_URL}/companies/{company_id}", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {get_company_response.status_code}")
        
        if get_company_response.status_code != 200:
            print(f"❌ Get company failed: {get_company_response.text}")
            results["get_company_by_id"] = False
        else:
            get_company_data = get_company_response.json()
            print(f"✅ Got company: {get_company_data['company_name']}")
            results["get_company_by_id"] = True
    except Exception as e:
        print(f"❌ Get company failed with exception: {str(e)}")
        results["get_company_by_id"] = False
    
    # Step 5: Update company
    print(f"\n🔍 Step 5: Update company {company_id}")
    try:
        update_payload = {
            "company_name": f"Updated Company {timestamp}",
            "phone": "987-654-3210"
        }
        
        update_response = requests.put(f"{API_URL}/companies/{company_id}", headers=auth_header, json=update_payload, timeout=TIMEOUT)
        print(f"Status Code: {update_response.status_code}")
        
        if update_response.status_code != 200:
            print(f"❌ Update company failed: {update_response.text}")
            results["update_company"] = False
        else:
            update_data = update_response.json()
            print(f"✅ Updated company name to: {update_data['company_name']}")
            results["update_company"] = True
    except Exception as e:
        print(f"❌ Update company failed with exception: {str(e)}")
        results["update_company"] = False
    
    # Step 6: Get company settings
    print(f"\n🔍 Step 6: Get company settings for {company_id}")
    try:
        settings_response = requests.get(f"{API_URL}/companies/{company_id}/settings", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {settings_response.status_code}")
        
        if settings_response.status_code != 200:
            print(f"❌ Get settings failed: {settings_response.text}")
            results["get_company_settings"] = False
        else:
            settings_data = settings_response.json()
            print(f"✅ Got {len(settings_data)} settings")
            results["get_company_settings"] = True
    except Exception as e:
        print(f"❌ Get settings failed with exception: {str(e)}")
        results["get_company_settings"] = False
    
    # Step 7: Update company settings
    print(f"\n🔍 Step 7: Update company settings for {company_id}")
    try:
        settings_payload = {
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
        
        update_settings_response = requests.put(f"{API_URL}/companies/{company_id}/settings", headers=auth_header, json=settings_payload, timeout=TIMEOUT)
        print(f"Status Code: {update_settings_response.status_code}")
        
        if update_settings_response.status_code != 200:
            print(f"❌ Update settings failed: {update_settings_response.text}")
            results["update_company_settings"] = False
        else:
            update_settings_data = update_settings_response.json()
            print(f"✅ Updated {len(update_settings_data)} settings")
            results["update_company_settings"] = True
    except Exception as e:
        print(f"❌ Update settings failed with exception: {str(e)}")
        results["update_company_settings"] = False
    
    # Step 8: Get settings by category
    print(f"\n🔍 Step 8: Get settings by category for {company_id}")
    try:
        category_response = requests.get(f"{API_URL}/companies/{company_id}/settings/preferences", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {category_response.status_code}")
        
        if category_response.status_code != 200:
            print(f"❌ Get settings by category failed: {category_response.text}")
            results["get_company_settings_by_category"] = False
        else:
            category_data = category_response.json()
            print(f"✅ Got {len(category_data)} settings for category 'preferences'")
            results["get_company_settings_by_category"] = True
    except Exception as e:
        print(f"❌ Get settings by category failed with exception: {str(e)}")
        results["get_company_settings_by_category"] = False
    
    # Step 9: Get company files
    print(f"\n🔍 Step 9: Get company files for {company_id}")
    try:
        files_response = requests.get(f"{API_URL}/companies/{company_id}/files", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {files_response.status_code}")
        
        if files_response.status_code != 200:
            print(f"❌ Get files failed: {files_response.text}")
            results["get_company_files"] = False
        else:
            files_data = files_response.json()
            print(f"✅ Got {len(files_data)} files")
            results["get_company_files"] = True
    except Exception as e:
        print(f"❌ Get files failed with exception: {str(e)}")
        results["get_company_files"] = False
    
    # Step 10: Upload a file
    print(f"\n🔍 Step 10: Upload file to company {company_id}")
    try:
        # Create a test file
        file_content = b"This is a test file content"
        test_file = io.BytesIO(file_content)
        
        # Generate a unique filename
        filename = f"test_file_{timestamp}.txt"
        
        files = {
            "file": (filename, test_file, "text/plain")
        }
        
        upload_response = requests.post(f"{API_URL}/companies/{company_id}/files", headers=auth_header, files=files, timeout=TIMEOUT)
        print(f"Status Code: {upload_response.status_code}")
        
        if upload_response.status_code != 200:
            print(f"❌ Upload file failed: {upload_response.text}")
            results["upload_company_file"] = False
        else:
            upload_data = upload_response.json()
            print(f"✅ Uploaded file: {upload_data['file_name']}")
            results["upload_company_file"] = True
    except Exception as e:
        print(f"❌ Upload file failed with exception: {str(e)}")
        results["upload_company_file"] = False
    
    # Step 11: Get company users
    print(f"\n🔍 Step 11: Get company users for {company_id}")
    try:
        users_response = requests.get(f"{API_URL}/companies/{company_id}/users", headers=auth_header, timeout=TIMEOUT)
        print(f"Status Code: {users_response.status_code}")
        
        if users_response.status_code != 200:
            print(f"❌ Get users failed: {users_response.text}")
            results["get_company_users"] = False
        else:
            users_data = users_response.json()
            print(f"✅ Got {len(users_data)} users")
            results["get_company_users"] = True
    except Exception as e:
        print(f"❌ Get users failed with exception: {str(e)}")
        results["get_company_users"] = False
    
    # Step 12: Invite user to company
    print(f"\n🔍 Step 12: Invite user to company {company_id}")
    try:
        invite_payload = {
            "email": f"invite_{timestamp}@example.com",
            "role": "employee",
            "permissions": {"view": True, "edit": False}
        }
        
        invite_response = requests.post(f"{API_URL}/companies/{company_id}/users/invite", headers=auth_header, json=invite_payload, timeout=TIMEOUT)
        print(f"Status Code: {invite_response.status_code}")
        
        if invite_response.status_code != 200:
            print(f"❌ Invite user failed: {invite_response.text}")
            results["invite_company_user"] = False
        else:
            invite_data = invite_response.json()
            print(f"✅ Invited user: {invite_data['message']}")
            results["invite_company_user"] = True
    except Exception as e:
        print(f"❌ Invite user failed with exception: {str(e)}")
        results["invite_company_user"] = False
    
    # Step 13: Test unauthorized access
    print(f"\n🔍 Step 13: Test unauthorized access to {company_id}")
    try:
        unauth_response = requests.get(f"{API_URL}/companies/{company_id}", timeout=TIMEOUT)
        print(f"Status Code: {unauth_response.status_code}")
        
        if unauth_response.status_code not in [401, 403]:
            print(f"❌ Unauthorized test failed: Expected 401 or 403, got {unauth_response.status_code}")
            results["unauthorized_access"] = False
        else:
            print("✅ Unauthorized access correctly rejected")
            results["unauthorized_access"] = True
    except Exception as e:
        print(f"❌ Unauthorized test failed with exception: {str(e)}")
        results["unauthorized_access"] = False
    
    # Step 14: Delete company (only if we created it in this test run)
    if results.get("create_company", False):
        print(f"\n🔍 Step 14: Delete company {company_id}")
        try:
            delete_response = requests.delete(f"{API_URL}/companies/{company_id}", headers=auth_header, timeout=TIMEOUT)
            print(f"Status Code: {delete_response.status_code}")
            
            if delete_response.status_code != 200:
                print(f"❌ Delete company failed: {delete_response.text}")
                results["delete_company"] = False
            else:
                delete_data = delete_response.json()
                print(f"✅ Deleted company: {delete_data['message']}")
                results["delete_company"] = True
        except Exception as e:
            print(f"❌ Delete company failed with exception: {str(e)}")
            results["delete_company"] = False
    
    # Print summary
    print("\n📊 Test Summary:")
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    print(f"\n🏁 Overall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return results

if __name__ == "__main__":
    results = run_company_management_tests()
    sys.exit(0 if all(results.values()) else 1)