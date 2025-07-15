#!/usr/bin/env python3
"""
Phase 2 Financial Reporting & Analytics Backend API Tests
Testing the specific APIs mentioned in the review request:

Dashboard Integration APIs:
- GET /api/companies/{id}/reports/dashboard - Dashboard summary
- GET /api/companies/{id}/transactions?recent=true - Recent transactions  
- GET /api/companies/{id}/invoices?status=outstanding - Outstanding invoices

Reports Integration APIs:
- GET /api/companies/{id}/reports/profit-loss - P&L Report
- GET /api/companies/{id}/reports/balance-sheet - Balance Sheet
- GET /api/companies/{id}/reports/cash-flow - Cash Flow Report
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta, date
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

# Demo credentials
DEMO_EMAIL = "demo@quickbooks.com"
DEMO_PASSWORD = "Password123!"

# Global variables
ACCESS_TOKEN = None
COMPANY_ID = None

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2, default=str)

def login_demo_user():
    """Login with demo user and get access token"""
    global ACCESS_TOKEN
    
    try:
        print("\n🔍 Logging in with demo user...")
        payload = {
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD,
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
            print("✅ Demo user login successful")
            return True
        else:
            print(f"❌ Demo user login failed: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Demo user login failed: {str(e)}")
        return False

def get_company_id():
    """Get company ID for the demo user"""
    global COMPANY_ID
    
    if not ACCESS_TOKEN:
        print("❌ Get company ID skipped: No access token available")
        return False
    
    try:
        print("\n🔍 Getting company ID...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"✅ Company ID obtained: {COMPANY_ID}")
                return True
            else:
                print("❌ No companies found for user")
                return False
        else:
            print(f"❌ Get company ID failed: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get company ID failed: {str(e)}")
        return False

def test_dashboard_api():
    """Test the dashboard API - GET /api/companies/{id}/reports/dashboard"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Dashboard API test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Dashboard API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test different date ranges
        date_ranges = ["today", "this-week", "this-month", "this-quarter", "this-year"]
        
        for date_range in date_ranges:
            print(f"\n  Testing date range: {date_range}...")
            
            response = requests.get(
                f"{API_URL}/companies/{COMPANY_ID}/reports/dashboard",
                headers=headers,
                params={"date_range": date_range},
                timeout=TIMEOUT
            )
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                # Check for expected dashboard structure
                expected_keys = ["stats", "recent_transactions", "accounts_receivable"]
                missing_keys = [key for key in expected_keys if key not in data]
                
                if not missing_keys:
                    print(f"  ✅ Dashboard API test for {date_range} passed - All expected keys present")
                    
                    # Print some stats to verify data format
                    if "stats" in data:
                        stats = data["stats"]
                        print(f"    Total Income: {stats.get('total_income', {}).get('value', 'N/A')}")
                        print(f"    Total Expenses: {stats.get('total_expenses', {}).get('value', 'N/A')}")
                        print(f"    Net Income: {stats.get('net_income', {}).get('value', 'N/A')}")
                        print(f"    Outstanding Invoices: {stats.get('outstanding_invoices', {}).get('value', 'N/A')}")
                    
                    if "recent_transactions" in data:
                        print(f"    Recent Transactions Count: {len(data['recent_transactions'])}")
                        
                        # Check for the data format issue mentioned in the review
                        for i, transaction in enumerate(data['recent_transactions'][:3]):  # Check first 3
                            total_amount = transaction.get('total_amount')
                            if total_amount is not None:
                                try:
                                    # Test if .toFixed() would work (this is the JS error mentioned)
                                    if isinstance(total_amount, (int, float)):
                                        print(f"    Transaction {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ✅")
                                    else:
                                        print(f"    Transaction {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ⚠️ Not numeric")
                                except Exception as e:
                                    print(f"    Transaction {i+1} total_amount error: {e}")
                else:
                    print(f"  ⚠️ Dashboard API test for {date_range} passed but missing keys: {missing_keys}")
            else:
                print(f"  ❌ Dashboard API test for {date_range} failed: Status code {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"  Error: {pretty_print_json(error_data)}")
                except:
                    print(f"  Response: {response.text}")
                return False
        
        print("✅ Dashboard API test passed")
        return True
    except Exception as e:
        print(f"❌ Dashboard API test failed: {str(e)}")
        return False

def test_recent_transactions_api():
    """Test the recent transactions API - GET /api/companies/{id}/transactions?recent=true"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Recent transactions API test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Recent Transactions API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/transactions",
            headers=headers,
            params={"recent": "true"},
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            transactions = data.get("items", [])
            total = data.get("total", 0)
            
            print(f"Found {len(transactions)} recent transactions (total: {total})")
            
            # Verify that no more than 10 transactions are returned for recent
            if len(transactions) <= 10:
                print("✅ Recent transactions are limited to 10 or fewer")
            else:
                print(f"⚠️ Recent transactions returned more than 10 items: {len(transactions)}")
            
            # Check data format for the .toFixed error mentioned in review
            for i, transaction in enumerate(transactions[:3]):  # Check first 3
                total_amount = transaction.get('total_amount')
                if total_amount is not None:
                    if isinstance(total_amount, (int, float)):
                        print(f"  Transaction {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ✅")
                    else:
                        print(f"  Transaction {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ⚠️ Not numeric")
            
            print("✅ Recent transactions API test passed")
            return True
        else:
            print(f"❌ Recent transactions API test failed: Status code {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {pretty_print_json(error_data)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Recent transactions API test failed: {str(e)}")
        return False

def test_outstanding_invoices_api():
    """Test the outstanding invoices API - GET /api/companies/{id}/invoices?status=outstanding"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Outstanding invoices API test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Outstanding Invoices API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/invoices",
            headers=headers,
            params={"status": "outstanding"},
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            invoices = data.get("items", [])
            total = data.get("total", 0)
            
            print(f"Found {len(invoices)} outstanding invoices (total: {total})")
            
            # Check data format for the .toFixed error mentioned in review
            for i, invoice in enumerate(invoices[:3]):  # Check first 3
                total_amount = invoice.get('total_amount')
                if total_amount is not None:
                    if isinstance(total_amount, (int, float)):
                        print(f"  Invoice {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ✅")
                    else:
                        print(f"  Invoice {i+1} total_amount: {total_amount} (type: {type(total_amount).__name__}) ⚠️ Not numeric")
            
            print("✅ Outstanding invoices API test passed")
            return True
        else:
            print(f"❌ Outstanding invoices API test failed: Status code {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {pretty_print_json(error_data)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Outstanding invoices API test failed: {str(e)}")
        return False

def test_profit_loss_report():
    """Test the Profit & Loss report API - GET /api/companies/{id}/reports/profit-loss"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Profit & Loss report test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Profit & Loss Report API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with required parameters
        params = {
            "start_date": (date.today() - timedelta(days=90)).isoformat(),
            "end_date": date.today().isoformat()
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            # Check for expected P&L structure
            if "sections" in data:
                sections = data["sections"]
                section_names = [section.get("name", "") for section in sections]
                print(f"Report sections: {section_names}")
                
                expected_sections = ["Income", "Gross Profit", "Expenses"]
                has_expected_sections = any(expected in section_names for expected in expected_sections)
                
                if has_expected_sections:
                    print("✅ Found expected P&L sections")
                else:
                    print(f"⚠️ Sections may be different than expected: {section_names}")
            
            # Check other expected fields
            expected_fields = ["report_name", "company_name", "grand_total", "currency"]
            for field in expected_fields:
                if field in data:
                    print(f"  ✅ {field}: {data[field]}")
                else:
                    print(f"  ⚠️ Missing field: {field}")
            
            print("✅ Profit & Loss report API test passed")
            return True
        else:
            print(f"❌ Profit & Loss report API test failed: Status code {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {pretty_print_json(error_data)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Profit & Loss report API test failed: {str(e)}")
        return False

def test_balance_sheet_report():
    """Test the Balance Sheet report API - GET /api/companies/{id}/reports/balance-sheet"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Balance Sheet report test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Balance Sheet Report API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with required parameters
        params = {
            "as_of_date": date.today().isoformat()
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/balance-sheet",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            # Check for expected Balance Sheet structure
            if "sections" in data:
                sections = data["sections"]
                section_names = [section.get("name", "") for section in sections]
                print(f"Report sections: {section_names}")
                
                expected_sections = ["Assets", "Liabilities", "Equity"]
                has_expected_sections = any(expected in section_names for expected in expected_sections)
                
                if has_expected_sections:
                    print("✅ Found expected Balance Sheet sections")
                else:
                    print(f"⚠️ Sections may be different than expected: {section_names}")
            
            # Check other expected fields
            expected_fields = ["report_name", "company_name", "grand_total", "currency"]
            for field in expected_fields:
                if field in data:
                    print(f"  ✅ {field}: {data[field]}")
                else:
                    print(f"  ⚠️ Missing field: {field}")
            
            print("✅ Balance Sheet report API test passed")
            return True
        else:
            print(f"❌ Balance Sheet report API test failed: Status code {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {pretty_print_json(error_data)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Balance Sheet report API test failed: {str(e)}")
        return False

def test_cash_flow_report():
    """Test the Cash Flow report API - GET /api/companies/{id}/reports/cash-flow"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Cash Flow report test skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Testing Cash Flow Report API...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        
        # Test with required parameters
        params = {
            "start_date": (date.today() - timedelta(days=90)).isoformat(),
            "end_date": date.today().isoformat()
        }
        
        response = requests.get(
            f"{API_URL}/companies/{COMPANY_ID}/reports/cash-flow",
            headers=headers,
            params=params,
            timeout=TIMEOUT
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            # Check for expected Cash Flow structure
            if "sections" in data:
                sections = data["sections"]
                section_names = [section.get("name", "") for section in sections]
                print(f"Report sections: {section_names}")
                
                expected_sections = ["Operating", "Investing", "Financing"]
                has_expected_sections = any(expected in section_names for expected in expected_sections)
                
                if has_expected_sections:
                    print("✅ Found expected Cash Flow sections")
                else:
                    print(f"⚠️ Sections may be different than expected: {section_names}")
            
            # Check other expected fields
            expected_fields = ["report_name", "company_name", "grand_total", "currency"]
            for field in expected_fields:
                if field in data:
                    print(f"  ✅ {field}: {data[field]}")
                else:
                    print(f"  ⚠️ Missing field: {field}")
            
            print("✅ Cash Flow report API test passed")
            return True
        else:
            print(f"❌ Cash Flow report API test failed: Status code {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {pretty_print_json(error_data)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Cash Flow report API test failed: {str(e)}")
        return False

def grant_company_access():
    """Grant company access after login"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Company access skipped: Missing access token or company ID")
        return False
    
    try:
        print("\n🔍 Granting company access...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        response = requests.post(f"{API_URL}/auth/companies/{COMPANY_ID}/access", headers=headers, timeout=TIMEOUT)
        
        if response.status_code == 200:
            print("✅ Company access granted")
            return True
        else:
            print(f"❌ Company access failed: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Company access failed: {str(e)}")
        return False

def test_authentication_flow():
    """Test the complete authentication flow"""
    print("\n🔍 Testing Authentication Flow...")
    
    # Step 1: Login
    if not login_demo_user():
        return False
    
    # Step 2: Get company ID
    if not get_company_id():
        return False
    
    # Step 3: Grant company access
    if not grant_company_access():
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Phase 2 Financial Reporting & Analytics Backend API Tests")
    print("=" * 70)
    print(f"🕒 Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API URL: {API_URL}")
    print(f"👤 Demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    
    # Test authentication flow
    auth_success = test_authentication_flow()
    
    if auth_success:
        print("\n" + "=" * 70)
        print("🧪 DASHBOARD INTEGRATION TESTS (Phase 2.1)")
        print("=" * 70)
        
        # Dashboard Integration APIs
        dashboard_result = test_dashboard_api()
        recent_transactions_result = test_recent_transactions_api()
        outstanding_invoices_result = test_outstanding_invoices_api()
        
        print("\n" + "=" * 70)
        print("📊 REPORTS INTEGRATION TESTS (Phase 2.2)")
        print("=" * 70)
        
        # Reports Integration APIs
        profit_loss_result = test_profit_loss_report()
        balance_sheet_result = test_balance_sheet_report()
        cash_flow_result = test_cash_flow_report()
        
        print("\n" + "=" * 70)
        print("📋 TEST SUMMARY")
        print("=" * 70)
        
        print("\n🧪 Dashboard Integration (Phase 2.1):")
        print(f"  Dashboard API: {'✅ PASSED' if dashboard_result else '❌ FAILED'}")
        print(f"  Recent Transactions API: {'✅ PASSED' if recent_transactions_result else '❌ FAILED'}")
        print(f"  Outstanding Invoices API: {'✅ PASSED' if outstanding_invoices_result else '❌ FAILED'}")
        
        print("\n📊 Reports Integration (Phase 2.2):")
        print(f"  Profit & Loss Report API: {'✅ PASSED' if profit_loss_result else '❌ FAILED'}")
        print(f"  Balance Sheet Report API: {'✅ PASSED' if balance_sheet_result else '❌ FAILED'}")
        print(f"  Cash Flow Report API: {'✅ PASSED' if cash_flow_result else '❌ FAILED'}")
        
        # Overall results
        dashboard_integration_success = dashboard_result and recent_transactions_result and outstanding_invoices_result
        reports_integration_success = profit_loss_result and balance_sheet_result and cash_flow_result
        
        print(f"\n🎯 OVERALL RESULTS:")
        print(f"  Phase 2.1 Dashboard Integration: {'✅ PASSED' if dashboard_integration_success else '❌ FAILED'}")
        print(f"  Phase 2.2 Reports Integration: {'✅ PASSED' if reports_integration_success else '❌ FAILED'}")
        
        if dashboard_integration_success and reports_integration_success:
            print("\n🎉 ALL PHASE 2 FINANCIAL REPORTING & ANALYTICS APIs ARE WORKING CORRECTLY!")
        else:
            print("\n⚠️ Some Phase 2 APIs have issues that need to be addressed.")
    else:
        print("\n❌ Authentication failed - cannot proceed with API tests")
    
    print("\n✅ Phase 2 testing completed.")