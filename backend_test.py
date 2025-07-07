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

# Global variables to store auth tokens
ACCESS_TOKEN = None
REFRESH_TOKEN = None
SESSION_ID = None
USER_ID = None

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        print("\n🔍 Testing root endpoint...")
        response = requests.get(f"{API_URL}/", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
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
            print(f"Response: {json.dumps(data, indent=2)}")
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

def test_auth_test_endpoint():
    """Test the auth test endpoint"""
    try:
        print("\n🔍 Testing auth test endpoint...")
        response = requests.get(f"{API_URL}/auth/test", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            if data.get("message") == "Auth endpoints are working":
                print("✅ Auth test endpoint test passed")
                return True
            else:
                print(f"❌ Auth test endpoint test failed: Unexpected response")
                return False
        else:
            print(f"❌ Auth test endpoint test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Auth test endpoint test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Auth test endpoint test failed: {str(e)}")
        return False

def test_register_user():
    """Test user registration"""
    try:
        print("\n🔍 Testing user registration...")
        # Generate a unique email to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        email = f"test_user_{timestamp}@example.com"
        
        payload = {
            "email": email,
            "password": "Test@123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "1234567890"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 201:
            if "user_id" in data and data.get("email") == email:
                print("✅ User registration test passed")
                return True, email
            else:
                print(f"❌ User registration test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ User registration test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ User registration test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ User registration test failed: {str(e)}")
        return False, None

def test_register_weak_password():
    """Test user registration with weak password"""
    try:
        print("\n🔍 Testing user registration with weak password...")
        # Generate a unique email to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        email = f"test_user_{timestamp}@example.com"
        
        payload = {
            "email": email,
            "password": "password",  # Weak password
            "first_name": "Test",
            "last_name": "User",
            "phone": "1234567890"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        # We expect this to fail with 400 Bad Request
        if response.status_code == 400:
            print("✅ Weak password rejection test passed")
            return True
        else:
            print(f"❌ Weak password rejection test failed: Expected 400, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Weak password rejection test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Weak password rejection test failed: {str(e)}")
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
            print(f"Response: {json.dumps(data, indent=2)}")
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

def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    try:
        print("\n🔍 Testing login with invalid credentials...")
        payload = {
            "email": "demo@quickbooks.com",
            "password": "WrongPassword123!",
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
        
        # We expect this to fail with 401 Unauthorized
        if response.status_code == 401:
            print("✅ Invalid credentials rejection test passed")
            return True
        else:
            print(f"❌ Invalid credentials rejection test failed: Expected 401, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Invalid credentials rejection test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Invalid credentials rejection test failed: {str(e)}")
        return False

def test_login_new_user(email):
    """Test login with newly registered user"""
    global ACCESS_TOKEN, REFRESH_TOKEN
    
    try:
        print(f"\n🔍 Testing login with new user ({email})...")
        payload = {
            "email": email,
            "password": "Test@123!",
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
                print("✅ New user login test passed")
                return True
            else:
                print(f"❌ New user login test failed: Unexpected response")
                return False
        else:
            print(f"❌ New user login test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ New user login test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ New user login test failed: {str(e)}")
        return False

def test_get_current_user():
    """Test getting current user profile"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Get current user test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing get current user profile...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/auth/me", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "user" in data and "companies" in data:
                print("✅ Get current user test passed")
                return True
            else:
                print(f"❌ Get current user test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get current user test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get current user test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get current user test failed: {str(e)}")
        return False

def test_get_user_sessions():
    """Test getting user sessions"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Get user sessions test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing get user sessions...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/auth/sessions", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list) and len(data) > 0:
                # Store a session ID for later tests
                global SESSION_ID
                SESSION_ID = data[0]["session_id"]
                print("✅ Get user sessions test passed")
                return True
            else:
                print(f"❌ Get user sessions test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get user sessions test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get user sessions test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get user sessions test failed: {str(e)}")
        return False

def test_get_user_companies():
    """Test getting user companies"""
    global ACCESS_TOKEN
    
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
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if isinstance(data, list):
                # Store company ID if available
                company_id = None
                if len(data) > 0:
                    company_id = data[0]["company"]["company_id"]
                print("✅ Get user companies test passed")
                return True, company_id
            else:
                print(f"❌ Get user companies test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Get user companies test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Get user companies test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Get user companies test failed: {str(e)}")
        return False, None

def test_company_access(company_id):
    """Test company access"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN or not company_id:
        print("❌ Company access test skipped: No access token or company ID available")
        return False
    
    try:
        print(f"\n🔍 Testing company access for company ID: {company_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.post(f"{API_URL}/auth/companies/{company_id}/access", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
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

def test_refresh_token():
    """Test refreshing access token"""
    global ACCESS_TOKEN, REFRESH_TOKEN
    
    if not REFRESH_TOKEN:
        print("❌ Refresh token test skipped: No refresh token available")
        return False
    
    try:
        print("\n🔍 Testing refresh token...")
        payload = {"refresh_token": REFRESH_TOKEN}
        
        response = requests.post(f"{API_URL}/auth/refresh-token", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "access_token" in data:
                ACCESS_TOKEN = data["access_token"]  # Update the access token
                print("✅ Refresh token test passed")
                return True
            else:
                print(f"❌ Refresh token test failed: Unexpected response")
                return False
        else:
            print(f"❌ Refresh token test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Refresh token test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Refresh token test failed: {str(e)}")
        return False

def test_change_password():
    """Test changing password"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Change password test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing change password...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "current_password": "Password123!",
            "new_password": "NewPassword123!"
        }
        
        response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and data.get("message") == "Password changed successfully":
                print("✅ Change password test passed")
                
                # Change back to original password for other tests
                payload = {
                    "current_password": "NewPassword123!",
                    "new_password": "Password123!"
                }
                
                response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
                if response.status_code == 200:
                    print("✅ Password changed back to original")
                    return True
                else:
                    print(f"❌ Failed to change password back to original: Status code {response.status_code}")
                    return False
            else:
                print(f"❌ Change password test failed: Unexpected response")
                return False
        else:
            print(f"❌ Change password test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Change password test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Change password test failed: {str(e)}")
        return False

def test_change_password_to_original():
    """Test changing password back to original (should fail with 400)"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Change password to original test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing change password to original (should fail)...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # First change password to something new
        payload = {
            "current_password": "Password123!",
            "new_password": "NewPassword123!"
        }
        
        response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
        if response.status_code != 200:
            print(f"❌ Setup for test failed: Could not change password initially")
            return False
        
        print("✅ Successfully changed password to new password")
        
        # Now try to change back to original (should fail with 400)
        payload = {
            "current_password": "NewPassword123!",
            "new_password": "Password123!"
        }
        
        response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        # We expect this to fail with 400 Bad Request
        if response.status_code == 400:
            if "detail" in data and "reuse" in data["detail"].lower():
                print("✅ Change password to original correctly rejected with 400 status code")
                
                # Change to a different password for cleanup
                payload = {
                    "current_password": "NewPassword123!",
                    "new_password": "DifferentPassword123!"
                }
                
                response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
                if response.status_code == 200:
                    # Now change back to original for other tests
                    payload = {
                        "current_password": "DifferentPassword123!",
                        "new_password": "Password123!"
                    }
                    
                    response = requests.put(f"{API_URL}/auth/change-password", headers=headers, json=payload, timeout=TIMEOUT)
                    if response.status_code == 200:
                        print("✅ Successfully reset password to original for other tests")
                        return True
                    else:
                        print(f"❌ Failed to reset password to original: Status code {response.status_code}")
                        return False
                else:
                    print(f"❌ Failed to change to different password: Status code {response.status_code}")
                    return False
            else:
                print(f"❌ Change password to original rejected but with wrong error message")
                return False
        else:
            print(f"❌ Change password to original test failed: Expected 400, got {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Change password to original test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Change password to original test failed: {str(e)}")
        return False

def test_logout_specific_session():
    """Test logging out a specific session"""
    global ACCESS_TOKEN, SESSION_ID
    
    if not ACCESS_TOKEN or not SESSION_ID:
        print("❌ Logout specific session test skipped: No access token or session ID available")
        return False
    
    try:
        print(f"\n🔍 Testing logout specific session (ID: {SESSION_ID})...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(f"{API_URL}/auth/sessions/{SESSION_ID}", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and data.get("message") == "Session logged out successfully":
                print("✅ Logout specific session test passed")
                return True
            else:
                print(f"❌ Logout specific session test failed: Unexpected response")
                return False
        else:
            print(f"❌ Logout specific session test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Logout specific session test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Logout specific session test failed: {str(e)}")
        return False

def test_forgot_password():
    """Test forgot password request"""
    try:
        print("\n🔍 Testing forgot password...")
        payload = {
            "email": "demo@quickbooks.com"
        }
        
        response = requests.post(f"{API_URL}/auth/forgot-password", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data:
                print("✅ Forgot password test passed")
                return True
            else:
                print(f"❌ Forgot password test failed: Unexpected response")
                return False
        else:
            print(f"❌ Forgot password test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Forgot password test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Forgot password test failed: {str(e)}")
        return False

def test_logout():
    """Test user logout"""
    global ACCESS_TOKEN
    
    if not ACCESS_TOKEN:
        print("❌ Logout test skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Testing user logout...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.post(f"{API_URL}/auth/logout", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 200:
            if "message" in data and data.get("message") == "Successfully logged out":
                print("✅ Logout test passed")
                ACCESS_TOKEN = None  # Clear the access token
                REFRESH_TOKEN = None  # Clear the refresh token
                return True
            else:
                print(f"❌ Logout test failed: Unexpected response")
                return False
        else:
            print(f"❌ Logout test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Logout test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Logout test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall status"""
    print("\n🔍 Starting QuickBooks Clone Authentication API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test results
    results = {
        "root_endpoint": test_root_endpoint(),
        "health_endpoint": test_health_endpoint(),
        "auth_test_endpoint": test_auth_test_endpoint(),
        "register_user": False,
        "register_weak_password": test_register_weak_password(),
        "login_demo_user": False,
        "login_invalid_credentials": test_login_invalid_credentials(),
        "login_new_user": False,
        "get_current_user": False,
        "get_user_sessions": False,
        "get_user_companies": False,
        "company_access": False,
        "refresh_token": False,
        "change_password": False,
        "logout_specific_session": False,
        "forgot_password": test_forgot_password(),
        "logout": False
    }
    
    # Test user registration
    register_result = test_register_user()
    if isinstance(register_result, tuple):
        results["register_user"] = register_result[0]
        email = register_result[1]
    else:
        results["register_user"] = register_result
        email = None
    
    # Test login with demo user
    results["login_demo_user"] = test_login_demo_user()
    
    # If demo login succeeded, test other authenticated endpoints
    if results["login_demo_user"]:
        results["get_current_user"] = test_get_current_user()
        results["get_user_sessions"] = test_get_user_sessions()
        
        # Test get user companies and company access
        companies_result = test_get_user_companies()
        if isinstance(companies_result, tuple):
            results["get_user_companies"] = companies_result[0]
            company_id = companies_result[1]
            
            if company_id:
                results["company_access"] = test_company_access(company_id)
        else:
            results["get_user_companies"] = companies_result
        
        results["refresh_token"] = test_refresh_token()
        results["change_password"] = test_change_password()
        
        if SESSION_ID:
            results["logout_specific_session"] = test_logout_specific_session()
        
        results["logout"] = test_logout()
    
    # If registration succeeded, test login with new user
    if results["register_user"] and email:
        results["login_new_user"] = test_login_new_user(email)
    
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