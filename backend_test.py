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

def test_login_demo_user():
    """Test login with demo user"""
    global ACCESS_TOKEN, REFRESH_TOKEN
    
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
        "auth_test_endpoint": test_auth_test_endpoint(),
        "register_user": False,
        "login_demo_user": False,
        "login_new_user": False,
        "get_current_user": False,
        "refresh_token": False,
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
        results["refresh_token"] = test_refresh_token()
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