#!/usr/bin/env python3
"""
Focused test for Communication and Purchase Order Management APIs
Based on the review request findings
"""
import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
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
TIMEOUT = 30  # seconds

# Global variables to store auth tokens and IDs
ACCESS_TOKEN = None
REFRESH_TOKEN = None
USER_ID = None
COMPANY_ID = None
VENDOR_ID = None

# Global variables for communication tests
EMAIL_TEMPLATE_ID = None
WEBHOOK_ID = None
NOTIFICATION_ID = None
PURCHASE_ORDER_ID = None

# Custom JSON encoder to handle decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def pretty_print_json(data):
    """Print JSON data with proper formatting and decimal handling"""
    return json.dumps(data, indent=2, cls=DecimalEncoder)

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
            print("✅ Demo user login test passed")
            return True
        else:
            print(f"❌ Demo user login test failed: Status code {response.status_code}")
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
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"Using company ID: {COMPANY_ID}")
            print("✅ Get user companies test passed")
            return True
        else:
            print(f"❌ Get user companies test failed: Status code {response.status_code}")
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
        
        if response.status_code == 200:
            print("✅ Company access test passed")
            return True
        else:
            print(f"❌ Company access test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Company access test failed: {str(e)}")
        return False

def test_get_vendors():
    """Test getting vendors for purchase order tests"""
    global ACCESS_TOKEN, COMPANY_ID, VENDOR_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get vendors test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get vendors...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/vendors/", 
            headers=headers, 
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data and "total" in data:
                if data["total"] > 0:
                    VENDOR_ID = data["items"][0]["vendor_id"]
                    print(f"Using vendor ID: {VENDOR_ID}")
                print(f"✅ Get vendors test passed (Found {data['total']} vendors)")
                return True
            else:
                print(f"❌ Get vendors test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get vendors test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get vendors test failed: {str(e)}")
        return False

# ===== COMMUNICATION API TESTS WITH CORRECTED SCHEMAS =====

def test_get_email_templates_corrected():
    """Test getting email templates"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get email templates test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get email templates...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates", 
            headers=headers, 
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get email templates test passed (Found {len(data)} templates)")
                return True
            else:
                print(f"❌ Get email templates test failed: Unexpected response format")
                return False
        else:
            print(f"❌ Get email templates test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get email templates test failed: {str(e)}")
        return False

def test_create_email_template_corrected():
    """Test creating an email template with correct field names"""
    global ACCESS_TOKEN, COMPANY_ID, EMAIL_TEMPLATE_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create email template test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing create email template with corrected schema...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        # Using correct field names based on EmailTemplateCreate schema
        payload = {
            "template_name": f"Test Template {timestamp}",
            "template_category": "invoices",  # Changed from "category" to "template_category"
            "subject_template": "Test Email Subject",  # Changed from "subject" to "subject_template"
            "body_template": "Hello {{customer_name}}, your invoice is ready!",  # Changed from "body" to "body_template"
            "is_html": False,
            "variables": {"customer_name": "Customer Name"}
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/emails/templates", 
            headers=headers, 
            json=payload,
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 201:
            if "template_id" in data:
                EMAIL_TEMPLATE_ID = data["template_id"]
                print(f"✅ Create email template test passed (ID: {EMAIL_TEMPLATE_ID})")
                return True
            else:
                print(f"❌ Create email template test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create email template test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Create email template test failed: {str(e)}")
        return False

def test_send_email_corrected():
    """Test sending an email"""
    global ACCESS_TOKEN, COMPANY_ID, EMAIL_TEMPLATE_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Send email test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing send email...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        payload = {
            "to_email": "test@example.com",
            "subject": "Test Email Subject",
            "body": "Test email body content",
            "priority": 1
        }
        
        if EMAIL_TEMPLATE_ID:
            payload["template_id"] = EMAIL_TEMPLATE_ID
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/emails/send", 
            headers=headers, 
            json=payload,
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            if "email_id" in data:
                print(f"✅ Send email test passed (ID: {data['email_id']})")
                return True
            else:
                print(f"❌ Send email test failed: Unexpected response")
                return False
        else:
            print(f"❌ Send email test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Send email test failed: {str(e)}")
        return False

def test_create_webhook_corrected():
    """Test creating a webhook with correct field names"""
    global ACCESS_TOKEN, COMPANY_ID, WEBHOOK_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Create webhook test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing create webhook with corrected schema...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        # Using correct field names based on WebhookSubscriptionCreate schema
        payload = {
            "webhook_url": "https://example.com/webhook",  # Changed from "url" to "webhook_url"
            "events": ["invoice.created", "payment.received"],
            "secret_key": "test-secret-key",  # Changed from "secret" to "secret_key"
            "timeout_seconds": 30,
            "auth_type": "none"
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/webhooks/", 
            headers=headers, 
            json=payload,
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 201:
            if "webhook_id" in data:
                WEBHOOK_ID = data["webhook_id"]
                print(f"✅ Create webhook test passed (ID: {WEBHOOK_ID})")
                return True
            else:
                print(f"❌ Create webhook test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create webhook test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Create webhook test failed: {str(e)}")
        return False

def test_create_notification_corrected():
    """Test creating a notification with correct enum value"""
    global ACCESS_TOKEN, COMPANY_ID, NOTIFICATION_ID, USER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not USER_ID:
        print("❌ Create notification test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing create notification with corrected schema...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        # Using correct enum value based on NotificationType schema
        payload = {
            "notification_type": "reminder",  # Changed from "invoice_reminder" to valid enum "reminder"
            "title": f"Test Notification {timestamp}",
            "message": "This is a test notification message",
            "priority": "normal",
            "user_id": USER_ID
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/notifications/", 
            headers=headers, 
            json=payload,
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 201:
            if "notification_id" in data:
                NOTIFICATION_ID = data["notification_id"]
                print(f"✅ Create notification test passed (ID: {NOTIFICATION_ID})")
                return True
            else:
                print(f"❌ Create notification test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create notification test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Create notification test failed: {str(e)}")
        return False

# ===== PURCHASE ORDER MANAGEMENT API TESTS WITH CORRECTED SCHEMAS =====

def test_create_purchase_order_corrected():
    """Test creating a purchase order with correct field names"""
    global ACCESS_TOKEN, COMPANY_ID, VENDOR_ID, PURCHASE_ORDER_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID or not VENDOR_ID:
        print("❌ Create purchase order test skipped: Missing required data")
        return False
    
    try:
        print("\n🔍 Testing create purchase order with corrected schema...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        # Using correct field names based on PurchaseOrderCreate schema
        payload = {
            "vendor_id": VENDOR_ID,
            "po_date": date.today().isoformat(),
            "expected_date": (date.today() + timedelta(days=7)).isoformat(),
            "memo": f"Test Purchase Order {timestamp}",
            "terms": "Net 30",
            "lines": [  # Changed from "line_items" to "lines"
                {
                    "item_id": "test-item-1",  # Using item_id as per PurchaseOrderLineCreate schema
                    "description": "Test Item 1",
                    "quantity_ordered": 10,  # Changed from "quantity" to "quantity_ordered"
                    "unit_cost": 25.00
                },
                {
                    "item_id": "test-item-2",
                    "description": "Test Item 2", 
                    "quantity_ordered": 5,
                    "unit_cost": 50.00
                }
            ]
        }
        
        response = requests.post(
            f"{API_URL}/companies/{COMPANY_ID}/purchase-orders/", 
            headers=headers, 
            json=payload,
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print(f"Response: {pretty_print_json(data)}")
        except:
            print(f"Response: {response.text}")
            return False
        
        if response.status_code == 201:
            if "purchase_order_id" in data or "po_id" in data:
                PURCHASE_ORDER_ID = data.get("purchase_order_id") or data.get("po_id")
                print(f"✅ Create purchase order test passed (ID: {PURCHASE_ORDER_ID})")
                return True
            else:
                print(f"❌ Create purchase order test failed: Unexpected response")
                return False
        else:
            print(f"❌ Create purchase order test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Create purchase order test failed: {str(e)}")
        return False

def test_get_purchase_orders_corrected():
    """Test getting purchase orders"""
    global ACCESS_TOKEN, COMPANY_ID
    
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Get purchase orders test skipped: No access token or company ID available")
        return False
    
    try:
        print("\n🔍 Testing get purchase orders...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/purchase-orders/", 
            headers=headers, 
            timeout=TIMEOUT,
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data and "total" in data:
                print(f"✅ Get purchase orders test passed (Found {data['total']} purchase orders)")
                return True
            else:
                print(f"❌ Get purchase orders test failed: Unexpected response")
                return False
        else:
            print(f"❌ Get purchase orders test failed: Status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get purchase orders test failed: {str(e)}")
        return False

def run_comprehensive_test():
    """Run comprehensive test of communication and purchase order APIs"""
    print("🚀 COMPREHENSIVE COMMUNICATION & PURCHASE ORDER API TESTING")
    print("=" * 70)
    
    # Authentication setup
    if not test_login_demo_user():
        print("❌ Authentication failed, stopping tests")
        return
    
    if not test_get_user_companies():
        print("❌ Company access failed, stopping tests")
        return
        
    if not test_company_access():
        print("❌ Company access verification failed, stopping tests")
        return
    
    # Get vendors for purchase order tests
    test_get_vendors()
    
    print("\n" + "=" * 70)
    print("📧 COMMUNICATION API TESTS (CORRECTED SCHEMAS)")
    print("=" * 70)
    
    # Email Management tests with corrected schemas
    email_templates_result = test_get_email_templates_corrected()
    email_template_create_result = test_create_email_template_corrected()
    send_email_result = test_send_email_corrected()
    
    # Webhook tests with corrected schemas
    webhook_create_result = test_create_webhook_corrected()
    
    # Notification tests with corrected schemas
    notification_create_result = test_create_notification_corrected()
    
    print("\n" + "=" * 70)
    print("📦 PURCHASE ORDER MANAGEMENT API TESTS (CORRECTED SCHEMAS)")
    print("=" * 70)
    
    # Purchase Order tests with corrected schemas
    po_create_result = test_create_purchase_order_corrected()
    po_get_result = test_get_purchase_orders_corrected()
    
    print("\n" + "=" * 70)
    print("📋 COMPREHENSIVE TEST SUMMARY")
    print("=" * 70)
    
    print("\n📧 COMMUNICATION API RESULTS:")
    print(f"  Get email templates: {'✅ PASSED' if email_templates_result else '❌ FAILED'}")
    print(f"  Create email template (corrected): {'✅ PASSED' if email_template_create_result else '❌ FAILED'}")
    print(f"  Send email: {'✅ PASSED' if send_email_result else '❌ FAILED'}")
    print(f"  Create webhook (corrected): {'✅ PASSED' if webhook_create_result else '❌ FAILED'}")
    print(f"  Create notification (corrected): {'✅ PASSED' if notification_create_result else '❌ FAILED'}")
    
    print("\n📦 PURCHASE ORDER MANAGEMENT API RESULTS:")
    print(f"  Create purchase order (corrected): {'✅ PASSED' if po_create_result else '❌ FAILED'}")
    print(f"  Get purchase orders: {'✅ PASSED' if po_get_result else '❌ FAILED'}")
    
    # Calculate overall results
    communication_passed = sum([email_templates_result, email_template_create_result, send_email_result, webhook_create_result, notification_create_result])
    communication_total = 5
    
    po_passed = sum([po_create_result, po_get_result])
    po_total = 2
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"  Communication APIs: {communication_passed}/{communication_total} passed")
    print(f"  Purchase Order APIs: {po_passed}/{po_total} passed")
    print(f"  Total: {communication_passed + po_passed}/{communication_total + po_total} passed")
    
    if communication_passed == communication_total and po_passed == po_total:
        print("\n🎉 ALL TESTS PASSED WITH CORRECTED SCHEMAS!")
    else:
        print(f"\n⚠️  SOME TESTS STILL FAILING - NEED FURTHER INVESTIGATION")

if __name__ == "__main__":
    run_comprehensive_test()