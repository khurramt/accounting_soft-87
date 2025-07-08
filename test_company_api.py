#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime

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

def test_company_management():
    """Test company management endpoints"""
    
    # Step 1: Login to get token
    print("\n🔍 Step 1: Login with demo user")
    login_payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    login_response = requests.post(f"{API_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
    print(f"Status Code: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print("❌ Login failed")
        return False
    
    login_data = login_response.json()
    access_token = login_data["access_token"]
    token_type = login_data["token_type"]
    auth_header = {"Authorization": f"{token_type} {access_token}"}
    
    print(f"✅ Login successful, got token: {access_token[:10]}...")
    
    # Step 2: Get user companies
    print("\n🔍 Step 2: Get user companies")
    companies_response = requests.get(f"{API_URL}/companies/", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {companies_response.status_code}")
    
    if companies_response.status_code != 200:
        print(f"❌ Get companies failed: {companies_response.text}")
        return False
    
    companies = companies_response.json()
    print(f"Found {len(companies)} companies")
    
    company_id = None
    if len(companies) > 0:
        company_id = companies[0]["company_id"]
        print(f"Using existing company ID: {company_id}")
    
    # Step 3: Create a new company
    print("\n🔍 Step 3: Create a new company")
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
        return False
    
    company_data = create_response.json()
    company_id = company_data["company_id"]
    print(f"✅ Created company: {company_name} with ID: {company_id}")
    
    # Step 4: Get company by ID
    print(f"\n🔍 Step 4: Get company by ID {company_id}")
    get_company_response = requests.get(f"{API_URL}/companies/{company_id}", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {get_company_response.status_code}")
    
    if get_company_response.status_code != 200:
        print(f"❌ Get company failed: {get_company_response.text}")
        return False
    
    get_company_data = get_company_response.json()
    print(f"✅ Got company: {get_company_data['company_name']}")
    
    # Step 5: Update company
    print(f"\n🔍 Step 5: Update company {company_id}")
    update_payload = {
        "company_name": f"Updated {company_name}",
        "phone": "987-654-3210"
    }
    
    update_response = requests.put(f"{API_URL}/companies/{company_id}", headers=auth_header, json=update_payload, timeout=TIMEOUT)
    print(f"Status Code: {update_response.status_code}")
    
    if update_response.status_code != 200:
        print(f"❌ Update company failed: {update_response.text}")
        return False
    
    update_data = update_response.json()
    print(f"✅ Updated company name to: {update_data['company_name']}")
    
    # Step 6: Get company settings
    print(f"\n🔍 Step 6: Get company settings for {company_id}")
    settings_response = requests.get(f"{API_URL}/companies/{company_id}/settings", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {settings_response.status_code}")
    
    if settings_response.status_code != 200:
        print(f"❌ Get settings failed: {settings_response.text}")
        return False
    
    settings_data = settings_response.json()
    print(f"✅ Got {len(settings_data)} settings")
    
    # Step 7: Update company settings
    print(f"\n🔍 Step 7: Update company settings for {company_id}")
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
        return False
    
    update_settings_data = update_settings_response.json()
    print(f"✅ Updated {len(update_settings_data)} settings")
    
    # Step 8: Get settings by category
    print(f"\n🔍 Step 8: Get settings by category for {company_id}")
    category_response = requests.get(f"{API_URL}/companies/{company_id}/settings/preferences", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {category_response.status_code}")
    
    if category_response.status_code != 200:
        print(f"❌ Get settings by category failed: {category_response.text}")
        return False
    
    category_data = category_response.json()
    print(f"✅ Got {len(category_data)} settings for category 'preferences'")
    
    # Step 9: Get company files
    print(f"\n🔍 Step 9: Get company files for {company_id}")
    files_response = requests.get(f"{API_URL}/companies/{company_id}/files", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {files_response.status_code}")
    
    if files_response.status_code != 200:
        print(f"❌ Get files failed: {files_response.text}")
        return False
    
    files_data = files_response.json()
    print(f"✅ Got {len(files_data)} files")
    
    # Step 10: Get company users
    print(f"\n🔍 Step 10: Get company users for {company_id}")
    users_response = requests.get(f"{API_URL}/companies/{company_id}/users", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {users_response.status_code}")
    
    if users_response.status_code != 200:
        print(f"❌ Get users failed: {users_response.text}")
        return False
    
    users_data = users_response.json()
    print(f"✅ Got {len(users_data)} users")
    
    # Step 11: Invite user to company
    print(f"\n🔍 Step 11: Invite user to company {company_id}")
    invite_payload = {
        "email": f"invite_{timestamp}@example.com",
        "role": "employee",
        "permissions": {"view": True, "edit": False}
    }
    
    invite_response = requests.post(f"{API_URL}/companies/{company_id}/users/invite", headers=auth_header, json=invite_payload, timeout=TIMEOUT)
    print(f"Status Code: {invite_response.status_code}")
    
    if invite_response.status_code != 200:
        print(f"❌ Invite user failed: {invite_response.text}")
        return False
    
    invite_data = invite_response.json()
    print(f"✅ Invited user: {invite_data['message']}")
    
    # Step 12: Test unauthorized access
    print(f"\n🔍 Step 12: Test unauthorized access to {company_id}")
    unauth_response = requests.get(f"{API_URL}/companies/{company_id}", timeout=TIMEOUT)
    print(f"Status Code: {unauth_response.status_code}")
    
    if unauth_response.status_code != 401:
        print(f"❌ Unauthorized test failed: Expected 401, got {unauth_response.status_code}")
        return False
    
    print("✅ Unauthorized access correctly rejected")
    
    # Step 13: Delete company
    print(f"\n🔍 Step 13: Delete company {company_id}")
    delete_response = requests.delete(f"{API_URL}/companies/{company_id}", headers=auth_header, timeout=TIMEOUT)
    print(f"Status Code: {delete_response.status_code}")
    
    if delete_response.status_code != 200:
        print(f"❌ Delete company failed: {delete_response.text}")
        return False
    
    delete_data = delete_response.json()
    print(f"✅ Deleted company: {delete_data['message']}")
    
    print("\n✅ All company management tests passed!")
    return True

if __name__ == "__main__":
    success = test_company_management()
    sys.exit(0 if success else 1)