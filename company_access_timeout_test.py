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
print(f"Using API URL: {API_URL}")

# Global variables
ACCESS_TOKEN = None
COMPANY_ID = None

def pretty_print_json(data):
    """Print JSON data with proper formatting"""
    return json.dumps(data, indent=2)

def test_login():
    """Test login with demo user"""
    global ACCESS_TOKEN
    
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
        timeout=10,
        verify=False
    )
    
    if response.status_code == 200:
        data = response.json()
        ACCESS_TOKEN = data["access_token"]
        print("✅ Login successful")
        return True
    else:
        print(f"❌ Login failed: {response.status_code}")
        return False

def test_get_companies():
    """Test getting user companies"""
    global COMPANY_ID
    
    print("\n🔍 Testing get user companies...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    response = requests.get(f"{API_URL}/auth/companies", headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if len(data) > 0:
            COMPANY_ID = data[0]["company"]["company_id"]
            print(f"✅ Companies retrieved, using company ID: {COMPANY_ID}")
            return True
    
    print(f"❌ Get companies failed: {response.status_code}")
    return False

def test_company_access_performance():
    """Test company access performance"""
    print(f"\n🔍 Testing company access performance for company ID: {COMPANY_ID}...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Test multiple times to check consistency
    for i in range(3):
        print(f"\n  Attempt {i+1}/3:")
        start_time = time.time()
        
        response = requests.post(
            f"{API_URL}/auth/companies/{COMPANY_ID}/access", 
            headers=headers, 
            timeout=15
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"    Status Code: {response.status_code}")
        print(f"    Response Time: {response_time:.2f} seconds")
        
        if response.status_code == 200:
            print(f"    ✅ Company access granted in {response_time:.2f}s")
        else:
            print(f"    ❌ Company access failed")
            return False
    
    return True

def test_companies_endpoint_performance():
    """Test GET /api/companies/ endpoint performance"""
    print(f"\n🔍 Testing GET /api/companies/ endpoint performance...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    start_time = time.time()
    
    response = requests.get(
        f"{API_URL}/companies/", 
        headers=headers, 
        timeout=15
    )
    
    end_time = time.time()
    response_time = end_time - start_time
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Time: {response_time:.2f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Companies endpoint working in {response_time:.2f}s")
        print(f"Found {len(data)} companies")
        return True
    else:
        print(f"❌ Companies endpoint failed")
        return False

def test_recent_transactions_timeout():
    """Test Recent Transactions API timeout issue"""
    print(f"\n🔍 Testing Recent Transactions API timeout issue...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Test with different timeout values
    timeout_values = [5, 10, 15, 20]
    
    for timeout_val in timeout_values:
        print(f"\n  Testing with {timeout_val}s timeout:")
        start_time = time.time()
        
        try:
            response = requests.get(
                f"{API_URL}/companies/{COMPANY_ID}/transactions?recent=true", 
                headers=headers, 
                timeout=timeout_val,
                verify=False
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"    Status Code: {response.status_code}")
            print(f"    Response Time: {response_time:.2f} seconds")
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ Recent transactions retrieved in {response_time:.2f}s")
                print(f"    Found {data.get('total', 0)} transactions")
                return True
            elif response.status_code == 403:
                print(f"    ❌ 403 Forbidden - Company access issue")
            else:
                print(f"    ❌ Failed with status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"    ❌ Request timed out after {timeout_val} seconds")
        except Exception as e:
            print(f"    ❌ Error: {str(e)}")
    
    return False

def test_outstanding_invoices_timeout():
    """Test Outstanding Invoices API timeout issue"""
    print(f"\n🔍 Testing Outstanding Invoices API timeout issue...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Test with different timeout values
    timeout_values = [5, 10, 15, 20]
    
    for timeout_val in timeout_values:
        print(f"\n  Testing with {timeout_val}s timeout:")
        start_time = time.time()
        
        try:
            response = requests.get(
                f"{API_URL}/companies/{COMPANY_ID}/invoices?status=outstanding", 
                headers=headers, 
                timeout=timeout_val,
                verify=False
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"    Status Code: {response.status_code}")
            print(f"    Response Time: {response_time:.2f} seconds")
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ Outstanding invoices retrieved in {response_time:.2f}s")
                print(f"    Found {data.get('total', 0)} invoices")
                return True
            elif response.status_code == 403:
                print(f"    ❌ 403 Forbidden - Company access issue")
            else:
                print(f"    ❌ Failed with status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"    ❌ Request timed out after {timeout_val} seconds")
        except Exception as e:
            print(f"    ❌ Error: {str(e)}")
    
    return False

def test_database_connection_issue():
    """Test if there are database connection issues"""
    print(f"\n🔍 Testing for database connection issues...")
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    # Test multiple endpoints to see which ones work and which don't
    endpoints = [
        ("Dashboard Summary", f"/companies/{COMPANY_ID}/reports/dashboard"),
        ("Accounts", f"/companies/{COMPANY_ID}/accounts/"),
        ("Customers", f"/companies/{COMPANY_ID}/customers/"),
        ("Vendors", f"/companies/{COMPANY_ID}/vendors/"),
        ("Items", f"/companies/{COMPANY_ID}/items/"),
        ("Recent Transactions", f"/companies/{COMPANY_ID}/transactions?recent=true"),
        ("Outstanding Invoices", f"/companies/{COMPANY_ID}/invoices?status=outstanding"),
    ]
    
    results = []
    
    for name, endpoint in endpoints:
        print(f"\n  Testing {name}...")
        start_time = time.time()
        
        try:
            response = requests.get(
                f"{API_URL}{endpoint}", 
                headers=headers, 
                timeout=12,
                verify=False
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"    Status: {response.status_code}, Time: {response_time:.2f}s")
            
            if response.status_code == 200:
                results.append((name, "✅ Working", response_time))
            elif response.status_code == 403:
                results.append((name, "❌ 403 Forbidden", response_time))
            else:
                results.append((name, f"❌ Status {response.status_code}", response_time))
                
        except requests.exceptions.Timeout:
            results.append((name, "❌ Timeout", 12.0))
        except Exception as e:
            results.append((name, f"❌ Error: {str(e)}", 0))
    
    print(f"\n📊 ENDPOINT PERFORMANCE SUMMARY:")
    print(f"{'Endpoint':<20} {'Status':<15} {'Time (s)':<10}")
    print("-" * 50)
    
    for name, status, time_taken in results:
        print(f"{name:<20} {status:<15} {time_taken:<10.2f}")
    
    return results

def main():
    """Main test function"""
    print("🚀 Company Access Timeout Issue Investigation")
    print("=" * 60)
    
    # Step 1: Login
    if not test_login():
        return
    
    # Step 2: Get companies
    if not test_get_companies():
        return
    
    # Step 3: Test company access performance
    test_company_access_performance()
    
    # Step 4: Test companies endpoint performance
    test_companies_endpoint_performance()
    
    # Step 5: Test recent transactions timeout
    test_recent_transactions_timeout()
    
    # Step 6: Test outstanding invoices timeout
    test_outstanding_invoices_timeout()
    
    # Step 7: Test database connection issues
    test_database_connection_issue()
    
    print("\n" + "=" * 60)
    print("🏁 Company Access Timeout Investigation Complete")

if __name__ == "__main__":
    main()