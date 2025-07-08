#!/usr/bin/env python3
import requests
import json
import sys
import os
from datetime import datetime, timedelta
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

# ===== NOTIFICATION API TESTS =====

def test_create_notification():
    """Test creating a notification"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create notification test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create notification...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "user_id": USER_ID,
            "notification_type": "system",
            "title": "Test Notification",
            "message": "This is a test notification created via API",
            "priority": "normal",
            "action_url": "https://example.com/action"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/", 
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
            if "notification_id" in data and data.get("title") == payload["title"]:
                notification_id = data["notification_id"]
                print(f"✅ Create notification test passed (ID: {notification_id})")
                return True, notification_id
            else:
                print(f"❌ Create notification test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create notification test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create notification test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create notification test failed: {str(e)}")
        return False, None

def test_create_bulk_notifications():
    """Test creating bulk notifications"""
    global ACCESS_TOKEN, COMPANY_ID, USER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not USER_ID:
        print("❌ Create bulk notifications test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing create bulk notifications...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "user_ids": [USER_ID],
            "notification_type": "alert",
            "title": "Bulk Test Notification",
            "message": "This is a bulk test notification created via API",
            "priority": "high",
            "action_url": "https://example.com/bulk-action"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/bulk", 
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
        
        if response.status_code == 201:
            if "created_count" in data and data["created_count"] > 0:
                print(f"✅ Create bulk notifications test passed (Created: {data['created_count']})")
                return True
            else:
                print(f"❌ Create bulk notifications test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create bulk notifications test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Create bulk notifications test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Create bulk notifications test failed: {str(e)}")
        return False

def test_get_notifications():
    """Test getting notifications with pagination and filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get notifications test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get notifications with pagination and filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination and filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "created_at",
            "sort_order": "desc",
            "notification_type": "system"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/", 
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
                print(f"✅ Get notifications test passed (Found {data['total']} notifications)")
                return True
            else:
                print(f"❌ Get notifications test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get notifications test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get notifications test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get notifications test failed: {str(e)}")
        return False

def test_get_notification_stats():
    """Test getting notification statistics"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get notification stats test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get notification statistics...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/stats", 
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
            if "total_notifications" in data and "unread_notifications" in data:
                print(f"✅ Get notification stats test passed")
                return True
            else:
                print(f"❌ Get notification stats test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get notification stats test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get notification stats test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get notification stats test failed: {str(e)}")
        return False

def test_mark_notification_read(notification_id):
    """Test marking a notification as read"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not notification_id:
        print("❌ Mark notification read test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing mark notification read: {notification_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "read": True
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/{notification_id}/read", 
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
            if "notification_id" in data and data["notification_id"] == notification_id and data["read"] == True:
                print("✅ Mark notification read test passed")
                return True
            else:
                print(f"❌ Mark notification read test failed: Unexpected response")
                return False
        else:
            print(f"❌ Mark notification read test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Mark notification read test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Mark notification read test failed: {str(e)}")
        return False

def test_mark_all_notifications_read():
    """Test marking all notifications as read"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Mark all notifications read test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing mark all notifications read...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/mark-all-read", 
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
            if "message" in data and "marked" in data["message"].lower():
                print("✅ Mark all notifications read test passed")
                return True
            else:
                print(f"❌ Mark all notifications read test failed: Unexpected response")
                return False
        else:
            print(f"❌ Mark all notifications read test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Mark all notifications read test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Mark all notifications read test failed: {str(e)}")
        return False

def test_delete_notification(notification_id):
    """Test deleting a notification"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not notification_id:
        print("❌ Delete notification test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete notification: {notification_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/{notification_id}", 
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
                print("✅ Delete notification test passed")
                return True
            else:
                print(f"❌ Delete notification test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete notification test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete notification test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete notification test failed: {str(e)}")
        return False

# ===== EMAIL MANAGEMENT API TESTS =====

def test_create_email_template():
    """Test creating an email template"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create email template test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create email template...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique template name to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "template_name": f"Test Template {timestamp}",
            "template_category": "test",
            "subject_template": "Test Subject with {{variable}}",
            "body_template": "This is a test email body with {{variable}} and {{another_variable}}.",
            "is_html": False,
            "variables": {
                "variable": "string",
                "another_variable": "string"
            }
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates", 
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
            if "template_id" in data and data.get("template_name") == payload["template_name"]:
                template_id = data["template_id"]
                print(f"✅ Create email template test passed (ID: {template_id})")
                return True, template_id
            else:
                print(f"❌ Create email template test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create email template test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create email template test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create email template test failed: {str(e)}")
        return False, None

def test_get_email_templates():
    """Test getting email templates"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get email templates test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get email templates...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with optional parameters
        params = {
            "category": "test",
            "is_active": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates", 
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
            print(f"✅ Get email templates test passed (Found {len(data)} templates)")
            return True
        else:
            print(f"❌ Get email templates test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get email templates test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get email templates test failed: {str(e)}")
        return False

def test_get_email_template_by_id(template_id):
    """Test getting an email template by ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not template_id:
        print("❌ Get email template by ID test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing get email template by ID: {template_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates/{template_id}", 
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
            if "template_id" in data and data["template_id"] == template_id:
                print("✅ Get email template by ID test passed")
                return True
            else:
                print(f"❌ Get email template by ID test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get email template by ID test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get email template by ID test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get email template by ID test failed: {str(e)}")
        return False

def test_update_email_template(template_id):
    """Test updating an email template"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not template_id:
        print("❌ Update email template test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update email template: {template_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated template data
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "template_name": f"Updated Template {timestamp}",
            "subject_template": "Updated Subject with {{variable}}",
            "body_template": "This is an updated test email body with {{variable}} and {{another_variable}}."
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates/{template_id}", 
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
            if "template_id" in data and data["template_id"] == template_id and data["template_name"] == payload["template_name"]:
                print("✅ Update email template test passed")
                return True
            else:
                print(f"❌ Update email template test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update email template test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update email template test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update email template test failed: {str(e)}")
        return False

def test_preview_email_template(template_id):
    """Test previewing an email template with variables"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not template_id:
        print("❌ Preview email template test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing preview email template: {template_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "variables": {
                "variable": "Test Value",
                "another_variable": "Another Test Value"
            }
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates/{template_id}/preview", 
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
            if "subject" in data and "body" in data:
                print("✅ Preview email template test passed")
                return True
            else:
                print(f"❌ Preview email template test failed: Unexpected response")
                return False
        else:
            print(f"❌ Preview email template test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Preview email template test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Preview email template test failed: {str(e)}")
        return False

def test_send_email():
    """Test sending an email"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Send email test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing send email...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "to_email": "test@example.com",
            "subject": "Test Email Subject",
            "body": "This is a test email body.",
            "priority": 1
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/emails/send", 
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
        
        if response.status_code == 201:
            if "email_id" in data and data.get("to_email") == payload["to_email"]:
                print(f"✅ Send email test passed (ID: {data['email_id']})")
                return True
            else:
                print(f"❌ Send email test failed: Unexpected response")
                return False
        else:
            print(f"❌ Send email test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Send email test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Send email test failed: {str(e)}")
        return False

def test_get_email_queue():
    """Test getting email queue with pagination and filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get email queue test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get email queue with pagination and filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination and filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "created_at",
            "sort_order": "desc",
            "status": "queued"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/emails/queue", 
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
                print(f"✅ Get email queue test passed (Found {data['total']} emails)")
                return True
            else:
                print(f"❌ Get email queue test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get email queue test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get email queue test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get email queue test failed: {str(e)}")
        return False

def test_get_email_stats():
    """Test getting email statistics"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get email stats test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get email statistics...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/emails/stats", 
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
            if "total_emails" in data and "emails_by_status" in data:
                print(f"✅ Get email stats test passed")
                return True
            else:
                print(f"❌ Get email stats test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get email stats test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get email stats test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get email stats test failed: {str(e)}")
        return False

def test_delete_email_template(template_id):
    """Test deleting an email template"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not template_id:
        print("❌ Delete email template test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete email template: {template_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates/{template_id}", 
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
                print("✅ Delete email template test passed")
                return True
            else:
                print(f"❌ Delete email template test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete email template test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete email template test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete email template test failed: {str(e)}")
        return False

# ===== WEBHOOK API TESTS =====

def test_create_webhook():
    """Test creating a webhook subscription"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create webhook test skipped: No access token or company ID available")
        return False, None
    
    try:
        print("\n🔍 Testing create webhook subscription...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Generate a unique identifier to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        payload = {
            "webhook_url": "https://webhook.site/test-webhook",
            "events": ["invoice.created", "payment.received"],
            "secret_key": f"test-secret-{timestamp}",
            "timeout_seconds": 30,
            "headers": {
                "X-Custom-Header": "Test Value"
            },
            "auth_type": "none"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/", 
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
            if "webhook_id" in data and data.get("webhook_url") == payload["webhook_url"]:
                webhook_id = data["webhook_id"]
                print(f"✅ Create webhook test passed (ID: {webhook_id})")
                return True, webhook_id
            else:
                print(f"❌ Create webhook test failed: Unexpected response")
                return False, None
        else:
            print(f"❌ Create webhook test failed: Status code {response.status_code}")
            return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Create webhook test failed: Request timed out after {TIMEOUT} seconds")
        return False, None
    except Exception as e:
        print(f"❌ Create webhook test failed: {str(e)}")
        return False, None

def test_get_webhooks():
    """Test getting webhook subscriptions"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get webhooks test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get webhook subscriptions...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with optional parameters
        params = {
            "is_active": True
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/", 
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
            print(f"✅ Get webhooks test passed (Found {len(data)} webhooks)")
            return True
        else:
            print(f"❌ Get webhooks test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get webhooks test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get webhooks test failed: {str(e)}")
        return False

def test_update_webhook(webhook_id):
    """Test updating a webhook subscription"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not webhook_id:
        print("❌ Update webhook test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing update webhook: {webhook_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Updated webhook data
        payload = {
            "events": ["invoice.created", "payment.received", "customer.created"],
            "timeout_seconds": 45
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/{webhook_id}", 
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
            if "webhook_id" in data and data["webhook_id"] == webhook_id and len(data["events"]) == 3:
                print("✅ Update webhook test passed")
                return True
            else:
                print(f"❌ Update webhook test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update webhook test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update webhook test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update webhook test failed: {str(e)}")
        return False

def test_webhook(webhook_id):
    """Test a webhook subscription"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not webhook_id:
        print("❌ Test webhook test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing webhook: {webhook_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "event_type": "invoice.created",
            "test_payload": {
                "invoice_id": "test-invoice-123",
                "amount": 100.00,
                "customer_id": "test-customer-456",
                "timestamp": datetime.now().isoformat()
            }
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/{webhook_id}/test", 
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
            if "message" in data and "test sent" in data["message"].lower():
                print("✅ Test webhook test passed")
                return True
            else:
                print(f"❌ Test webhook test failed: Unexpected response")
                return False
        else:
            print(f"❌ Test webhook test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Test webhook test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Test webhook test failed: {str(e)}")
        return False

def test_delete_webhook(webhook_id):
    """Test deleting a webhook subscription"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not webhook_id:
        print("❌ Delete webhook test skipped: Missing required data")
        return False
    
    try:
        print(f"\n🔍 Testing delete webhook: {webhook_id}...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.delete(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/{webhook_id}", 
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
                print("✅ Delete webhook test passed")
                return True
            else:
                print(f"❌ Delete webhook test failed: Unexpected response")
                return False
        else:
            print(f"❌ Delete webhook test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Delete webhook test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Delete webhook test failed: {str(e)}")
        return False

# ===== SMS MANAGEMENT API TESTS =====

def test_send_sms():
    """Test sending an SMS"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Send SMS test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing send SMS...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "to_phone": "+15551234567",
            "message": "This is a test SMS message."
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/sms/send", 
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
        
        if response.status_code == 201:
            if "sms_id" in data and data.get("to_phone") == payload["to_phone"]:
                print(f"✅ Send SMS test passed (ID: {data['sms_id']})")
                return True
            else:
                print(f"❌ Send SMS test failed: Unexpected response")
                return False
        else:
            print(f"❌ Send SMS test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Send SMS test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Send SMS test failed: {str(e)}")
        return False

def test_get_sms_queue():
    """Test getting SMS queue with pagination and filtering"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get SMS queue test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get SMS queue with pagination and filtering...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with pagination and filtering parameters
        params = {
            "page": 1,
            "page_size": 10,
            "sort_by": "created_at",
            "sort_order": "desc",
            "status": "queued"
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/sms/queue", 
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
                print(f"✅ Get SMS queue test passed (Found {data['total']} SMS messages)")
                return True
            else:
                print(f"❌ Get SMS queue test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get SMS queue test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get SMS queue test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get SMS queue test failed: {str(e)}")
        return False

def test_get_sms_stats():
    """Test getting SMS statistics"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get SMS stats test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get SMS statistics...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/sms/stats", 
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
            if "total_sms" in data and "sms_by_status" in data:
                print(f"✅ Get SMS stats test passed")
                return True
            else:
                print(f"❌ Get SMS stats test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get SMS stats test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get SMS stats test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get SMS stats test failed: {str(e)}")
        return False

# ===== NOTIFICATION PREFERENCES API TESTS =====

def test_get_notification_preferences():
    """Test getting notification preferences"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get notification preferences test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get notification preferences...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/notification-preferences/", 
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
            print(f"✅ Get notification preferences test passed (Found {len(data)} preferences)")
            return True
        else:
            print(f"❌ Get notification preferences test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get notification preferences test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get notification preferences test failed: {str(e)}")
        return False

def test_get_specific_notification_preference():
    """Test getting a specific notification preference"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get specific notification preference test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get specific notification preference...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        notification_type = "system"
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/notification-preferences/{notification_type}", 
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
            if "notification_type" in data and data["notification_type"] == notification_type:
                print("✅ Get specific notification preference test passed")
                return True
            else:
                print(f"❌ Get specific notification preference test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get specific notification preference test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Get specific notification preference test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Get specific notification preference test failed: {str(e)}")
        return False

def test_update_notification_preference():
    """Test updating a notification preference"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Update notification preference test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing update notification preference...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        notification_type = "system"
        
        payload = {
            "in_app_enabled": True,
            "email_enabled": False,
            "sms_enabled": False,
            "push_enabled": True,
            "frequency": "immediate"
        }
        
        response = requests.put(
            f"{API_URL}/companies/{COMPANY_ID}/notification-preferences/{notification_type}", 
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
            if ("notification_type" in data and data["notification_type"] == notification_type and
                data["in_app_enabled"] == payload["in_app_enabled"] and
                data["email_enabled"] == payload["email_enabled"]):
                print("✅ Update notification preference test passed")
                return True
            else:
                print(f"❌ Update notification preference test failed: Unexpected response")
                return False
        else:
            print(f"❌ Update notification preference test failed: Status code {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print(f"❌ Update notification preference test failed: Request timed out after {TIMEOUT} seconds")
        return False
    except Exception as e:
        print(f"❌ Update notification preference test failed: {str(e)}")
        return False

def run_notification_communication_tests():
    """Run all Notification & Communication Module API tests"""
    print("\n🔍 Starting QuickBooks Clone Notification & Communication Module API tests...")
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
    
    # Test Notifications API
    print("\n📋 Testing Notifications API...")
    notification_result, notification_id = test_create_notification()
    results["create_notification"] = notification_result
    
    results["create_bulk_notifications"] = test_create_bulk_notifications()
    results["get_notifications"] = test_get_notifications()
    results["get_notification_stats"] = test_get_notification_stats()
    
    if notification_id:
        results["mark_notification_read"] = test_mark_notification_read(notification_id)
        results["delete_notification"] = test_delete_notification(notification_id)
    
    results["mark_all_notifications_read"] = test_mark_all_notifications_read()
    
    # Test Email Management API
    print("\n📋 Testing Email Management API...")
    template_result, template_id = test_create_email_template()
    results["create_email_template"] = template_result
    
    results["get_email_templates"] = test_get_email_templates()
    
    if template_id:
        results["get_email_template_by_id"] = test_get_email_template_by_id(template_id)
        results["update_email_template"] = test_update_email_template(template_id)
        results["preview_email_template"] = test_preview_email_template(template_id)
        results["delete_email_template"] = test_delete_email_template(template_id)
    
    results["send_email"] = test_send_email()
    results["get_email_queue"] = test_get_email_queue()
    results["get_email_stats"] = test_get_email_stats()
    
    # Test Webhooks API
    print("\n📋 Testing Webhooks API...")
    webhook_result, webhook_id = test_create_webhook()
    results["create_webhook"] = webhook_result
    
    results["get_webhooks"] = test_get_webhooks()
    
    if webhook_id:
        results["update_webhook"] = test_update_webhook(webhook_id)
        results["test_webhook"] = test_webhook(webhook_id)
        results["delete_webhook"] = test_delete_webhook(webhook_id)
    
    # Test SMS Management API
    print("\n📋 Testing SMS Management API...")
    results["send_sms"] = test_send_sms()
    results["get_sms_queue"] = test_get_sms_queue()
    results["get_sms_stats"] = test_get_sms_stats()
    
    # Test Notification Preferences API
    print("\n📋 Testing Notification Preferences API...")
    results["get_notification_preferences"] = test_get_notification_preferences()
    results["get_specific_notification_preference"] = test_get_specific_notification_preference()
    results["update_notification_preference"] = test_update_notification_preference()
    
    # Print summary
    print("\n📊 Notification & Communication Module API Test Summary:")
    success_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    print(f"✅ {success_count}/{total_count} tests passed ({success_count/total_count*100:.1f}%)")
    
    for test_name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    return success_count == total_count

if __name__ == "__main__":
    # Run tests
    print("🚀 Starting QuickBooks Clone Notification & Communication Module API tests...")
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test basic endpoints
    test_root_endpoint()
    test_health_endpoint()
    
    # Test authentication
    if test_login_demo_user():
        test_get_user_companies()
        if COMPANY_ID:
            test_company_access()
            
            # Test Notification & Communication Module
            run_notification_communication_tests()
    
    print("\n✅ Tests completed!")