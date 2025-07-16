#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime, date, timedelta

# Get the backend URL from the frontend .env file
def get_backend_url():
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.strip().split('=')[1].strip('"\'')
    return None

BACKEND_URL = get_backend_url()
API_URL = f"{BACKEND_URL}/api"
TIMEOUT = 30

# Global variables
ACCESS_TOKEN = None
COMPANY_ID = None

def pretty_print_json(data):
    return json.dumps(data, indent=2)

def login_and_setup():
    """Login and get company access"""
    global ACCESS_TOKEN, COMPANY_ID
    
    # Login
    payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=payload, timeout=TIMEOUT, verify=False)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return False
    
    data = response.json()
    ACCESS_TOKEN = data["access_token"]
    
    # Get companies
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=TIMEOUT)
    if response.status_code != 200:
        print(f"❌ Get companies failed: {response.status_code}")
        return False
    
    companies = response.json()
    COMPANY_ID = companies[0]["company"]["company_id"]
    
    # Access company
    response = requests.post(f"{API_URL}/auth/companies/{COMPANY_ID}/access", headers=headers, timeout=TIMEOUT)
    if response.status_code != 200:
        print(f"❌ Company access failed: {response.status_code}")
        return False
    
    print(f"✅ Successfully logged in and accessed company: {COMPANY_ID}")
    return True

def test_company_financial_reports():
    """Test all Company & Financial Reports APIs"""
    if not ACCESS_TOKEN or not COMPANY_ID:
        print("❌ Not authenticated")
        return False
    
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    today = date.today()
    start_of_month = today.replace(day=1)
    
    print("\n🎯 TESTING COMPANY & FINANCIAL REPORTS APIs")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Profit & Loss Report
    print("\n1. Testing Profit & Loss Report API...")
    pl_params = {
        "start_date": start_of_month.isoformat(),
        "end_date": today.isoformat(),
        "comparison_type": "none",
        "include_subtotals": True,
        "show_cents": True
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", headers=headers, params=pl_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ Profit & Loss Report: {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("Profit & Loss Report", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Profit & Loss Report", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Profit & Loss Report", False))
    
    # Test 2: Balance Sheet Report
    print("\n2. Testing Balance Sheet Report API...")
    bs_params = {
        "as_of_date": today.isoformat(),
        "include_subtotals": True,
        "show_cents": True
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/balance-sheet", headers=headers, params=bs_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ Balance Sheet Report: {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("Balance Sheet Report", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Balance Sheet Report", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Balance Sheet Report", False))
    
    # Test 3: Cash Flow Report (Indirect)
    print("\n3. Testing Cash Flow Report API (Indirect Method)...")
    cf_params = {
        "start_date": start_of_month.isoformat(),
        "end_date": today.isoformat(),
        "method": "indirect",
        "include_subtotals": True,
        "show_cents": True
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/cash-flow", headers=headers, params=cf_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ Cash Flow Report (Indirect): {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("Cash Flow Report (Indirect)", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Cash Flow Report (Indirect)", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Cash Flow Report (Indirect)", False))
    
    # Test 4: Cash Flow Report (Direct)
    print("\n4. Testing Cash Flow Report API (Direct Method)...")
    cf_params_direct = {
        "start_date": start_of_month.isoformat(),
        "end_date": today.isoformat(),
        "method": "direct",
        "include_subtotals": True,
        "show_cents": True
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/cash-flow", headers=headers, params=cf_params_direct, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ Cash Flow Report (Direct): {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("Cash Flow Report (Direct)", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Cash Flow Report (Direct)", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Cash Flow Report (Direct)", False))
    
    # Test 5: Trial Balance Report
    print("\n5. Testing Trial Balance Report API...")
    tb_params = {
        "as_of_date": today.isoformat(),
        "include_zero_balances": False,
        "show_cents": True
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/trial-balance", headers=headers, params=tb_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ Trial Balance Report: {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("Trial Balance Report", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Trial Balance Report", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Trial Balance Report", False))
    
    # Test 6: AR Aging Report
    print("\n6. Testing AR Aging Report API...")
    ar_params = {
        "as_of_date": today.isoformat(),
        "aging_periods": [30, 60, 90, 120],
        "include_zero_balances": False
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/ar-aging", headers=headers, params=ar_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ AR Aging Report: {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("AR Aging Report", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("AR Aging Report", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("AR Aging Report", False))
    
    # Test 7: AP Aging Report
    print("\n7. Testing AP Aging Report API...")
    ap_params = {
        "as_of_date": today.isoformat(),
        "aging_periods": [30, 60, 90, 120],
        "include_zero_balances": False
    }
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/ap-aging", headers=headers, params=ap_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["report_name", "company_name", "sections", "grand_total", "currency"]
        if all(field in data for field in required_fields):
            print(f"   ✅ AP Aging Report: {data['report_name']} - {data['grand_total']} {data['currency']}")
            test_results.append(("AP Aging Report", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("AP Aging Report", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("AP Aging Report", False))
    
    # Test 8: Dashboard Summary
    print("\n8. Testing Dashboard Summary API...")
    dashboard_params = {"date_range": "this-month"}
    
    response = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/dashboard", headers=headers, params=dashboard_params, timeout=TIMEOUT)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        required_fields = ["date_range", "stats", "recent_transactions", "accounts_receivable"]
        if all(field in data for field in required_fields):
            stats = data.get('stats', {})
            print(f"   ✅ Dashboard Summary: Income ${stats.get('total_income', {}).get('value', 0)}, Expenses ${stats.get('total_expenses', {}).get('value', 0)}")
            test_results.append(("Dashboard Summary", True))
        else:
            print(f"   ❌ Missing fields: {[f for f in required_fields if f not in data]}")
            test_results.append(("Dashboard Summary", False))
    else:
        print(f"   ❌ Failed with status {response.status_code}")
        test_results.append(("Dashboard Summary", False))
    
    # Test 9: Authentication Test
    print("\n9. Testing Authentication Requirements...")
    response_no_auth = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", params=pl_params, timeout=TIMEOUT)
    
    if response_no_auth.status_code in [401, 403]:
        print(f"   ✅ Authentication properly required (Status: {response_no_auth.status_code})")
        test_results.append(("Authentication Required", True))
    else:
        print(f"   ❌ Authentication not enforced (Status: {response_no_auth.status_code})")
        test_results.append(("Authentication Required", False))
    
    # Test 10: Company Access Validation
    print("\n10. Testing Company Access Validation...")
    fake_company_id = "fake-company-id-12345"
    response_fake = requests.get(f"{API_URL}/companies/{fake_company_id}/reports/profit-loss", headers=headers, params=pl_params, timeout=TIMEOUT)
    
    if response_fake.status_code == 403:
        print(f"   ✅ Company access validation working (Status: {response_fake.status_code})")
        test_results.append(("Company Access Validation", True))
    else:
        print(f"   ❌ Company access validation failed (Status: {response_fake.status_code})")
        test_results.append(("Company Access Validation", False))
    
    # Test 11: Parameter Validation
    print("\n11. Testing Parameter Validation...")
    response_missing = requests.get(f"{API_URL}/companies/{COMPANY_ID}/reports/profit-loss", headers=headers, timeout=TIMEOUT)
    
    if response_missing.status_code == 422:
        print(f"   ✅ Parameter validation working (Status: {response_missing.status_code})")
        test_results.append(("Parameter Validation", True))
    else:
        print(f"   ❌ Parameter validation failed (Status: {response_missing.status_code})")
        test_results.append(("Parameter Validation", False))
    
    # Summary
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    success_rate = (passed / total) * 100
    
    print("\n" + "=" * 60)
    print("📊 COMPANY & FINANCIAL REPORTS API TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in test_results:
        status = "✅" if result else "❌"
        print(f"{test_name:<35} {status}")
    
    print("=" * 60)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL COMPANY & FINANCIAL REPORTS APIs ARE WORKING CORRECTLY!")
        return True
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
        return False

def main():
    print("🚀 Company & Financial Reports Backend API Testing")
    print(f"Testing against: {API_URL}")
    print("=" * 60)
    
    if not login_and_setup():
        sys.exit(1)
    
    success = test_company_financial_reports()
    
    if success:
        print("\n✅ All Company & Financial Reports APIs are working correctly!")
        print("The Company & Financial reports page has full backend support.")
    else:
        print("\n❌ Some Company & Financial Reports APIs have issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()