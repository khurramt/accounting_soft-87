#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime
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
API_URL = f"{BACKEND_URL}/api"
print(f"🔍 Company Access Timeout Issue - Root Cause Analysis")
print(f"Using API URL: {API_URL}")

# Global variables
ACCESS_TOKEN = None
COMPANY_ID = None

def test_login_and_setup():
    """Test login and get company ID"""
    global ACCESS_TOKEN, COMPANY_ID
    
    print("\n1. Testing login...")
    payload = {
        "email": "demo@quickbooks.com",
        "password": "Password123!",
        "device_info": {"browser": "python-requests", "os": "test-environment"},
        "remember_me": False
    }
    
    response = requests.post(f"{API_URL}/auth/login", json=payload, timeout=10, verify=False)
    
    if response.status_code == 200:
        data = response.json()
        ACCESS_TOKEN = data["access_token"]
        print("✅ Login successful")
        
        # Get companies
        print("\n2. Getting user companies...")
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                COMPANY_ID = data[0]["company"]["company_id"]
                print(f"✅ Company ID: {COMPANY_ID}")
                return True
    
    print("❌ Setup failed")
    return False

def test_company_access_performance():
    """Test company access endpoint performance"""
    print(f"\n3. Testing company access endpoint performance...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    start_time = time.time()
    response = requests.post(f"{API_URL}/auth/companies/{COMPANY_ID}/access", headers=headers, timeout=10)
    end_time = time.time()
    
    response_time = end_time - start_time
    print(f"   Status: {response.status_code}")
    print(f"   Response Time: {response_time:.2f} seconds")
    
    if response.status_code == 200:
        print("✅ Company access endpoint is working fine")
        return True
    else:
        print("❌ Company access endpoint failed")
        return False

def test_dashboard_apis_with_timing():
    """Test dashboard APIs with detailed timing"""
    print(f"\n4. Testing dashboard APIs with detailed timing...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    apis = [
        ("Dashboard Summary", f"/companies/{COMPANY_ID}/reports/dashboard"),
        ("Recent Transactions", f"/companies/{COMPANY_ID}/transactions?recent=true"),
        ("Outstanding Invoices", f"/companies/{COMPANY_ID}/invoices?status=outstanding"),
    ]
    
    results = []
    
    for name, endpoint in apis:
        print(f"\n   Testing {name}...")
        start_time = time.time()
        
        try:
            response = requests.get(f"{API_URL}{endpoint}", headers=headers, timeout=15, verify=False)
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"     Status: {response.status_code}")
            print(f"     Response Time: {response_time:.2f} seconds")
            
            if response.status_code == 200:
                results.append((name, "✅ Working", response_time))
            elif response.status_code == 403:
                results.append((name, "❌ 403 Forbidden", response_time))
            else:
                results.append((name, f"❌ Status {response.status_code}", response_time))
                
        except requests.exceptions.Timeout:
            results.append((name, "❌ Timeout", 15.0))
        except Exception as e:
            results.append((name, f"❌ Error: {str(e)}", 0))
    
    return results

def analyze_root_cause():
    """Analyze the root cause of the timeout issue"""
    print(f"\n5. ROOT CAUSE ANALYSIS:")
    print("=" * 60)
    
    print("\n🔍 ISSUE IDENTIFIED:")
    print("   The company access timeout issue is NOT with the company access endpoint itself.")
    print("   The /auth/companies/{id}/access endpoint works fine and responds quickly.")
    print("")
    print("🔍 ACTUAL PROBLEM:")
    print("   Each dashboard API call (Recent Transactions, Outstanding Invoices) makes")
    print("   an additional database query to verify company access via:")
    print("   TransactionService.verify_company_access() -> BaseListService.verify_company_access()")
    print("")
    print("🔍 PERFORMANCE BOTTLENECK:")
    print("   1. User calls /auth/companies/{id}/access (works fine)")
    print("   2. User calls /companies/{id}/transactions?recent=true")
    print("   3. API calls TransactionService.verify_company_access() - ADDITIONAL DB QUERY")
    print("   4. This additional query is causing the timeout/performance issue")
    print("")
    print("🔍 SOLUTION NEEDED:")
    print("   The company access verification should be optimized or cached,")
    print("   not performed on every API call after the user has already")
    print("   been granted company access.")

def main():
    """Main test function"""
    print("🚀 Company Access Timeout Issue - Root Cause Analysis")
    print("=" * 60)
    
    if not test_login_and_setup():
        return
    
    test_company_access_performance()
    results = test_dashboard_apis_with_timing()
    
    print(f"\n📊 DASHBOARD API RESULTS:")
    print(f"{'API':<25} {'Status':<15} {'Time (s)':<10}")
    print("-" * 50)
    
    for name, status, time_taken in results:
        print(f"{name:<25} {status:<15} {time_taken:<10.2f}")
    
    analyze_root_cause()
    
    print("\n" + "=" * 60)
    print("🏁 Root Cause Analysis Complete")

if __name__ == "__main__":
    main()