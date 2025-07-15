#!/usr/bin/env python3
"""
Focused test for Recent Transactions API performance issue
"""
import sys
import os

# Add the current directory to Python path to import backend_test
sys.path.insert(0, '/app')

from backend_test import (
    test_root_endpoint,
    test_health_endpoint,
    test_login_demo_user,
    test_get_user_companies,
    test_company_access,
    test_recent_transactions_performance
)

def main():
    """Run focused Recent Transactions API performance test"""
    print("=" * 80)
    print("🎯 RECENT TRANSACTIONS API PERFORMANCE TEST")
    print("=" * 80)
    print("Testing the specific performance issue mentioned in the continuation request:")
    print("- Previous issue: API timeout at 30+ seconds")
    print("- Requirement: Response under 10 seconds")
    print("- Expected: Maximum 10 transactions")
    print("- Demo credentials: demo@quickbooks.com / Password123!")
    print("=" * 80)
    
    # Track test results
    tests_passed = 0
    total_tests = 0
    
    # Step 1: Basic connectivity tests
    print("\n🔧 STEP 1: Basic API Connectivity")
    
    total_tests += 1
    if test_root_endpoint():
        tests_passed += 1
    
    total_tests += 1
    if test_health_endpoint():
        tests_passed += 1
    
    # Step 2: Authentication flow
    print("\n🔐 STEP 2: Authentication Flow")
    
    total_tests += 1
    if test_login_demo_user():
        tests_passed += 1
    else:
        print("❌ Cannot proceed without authentication")
        return False
    
    total_tests += 1
    if test_get_user_companies():
        tests_passed += 1
    else:
        print("❌ Cannot proceed without company access")
        return False
    
    total_tests += 1
    if test_company_access():
        tests_passed += 1
    else:
        print("❌ Cannot proceed without company access grant")
        return False
    
    # Step 3: The main performance test
    print("\n🚀 STEP 3: Recent Transactions API Performance Test")
    print("This is the critical test to verify if the timeout issue has been resolved...")
    
    total_tests += 1
    performance_result = test_recent_transactions_performance()
    if performance_result:
        tests_passed += 1
    
    # Final results
    print("\n" + "=" * 80)
    print("📊 FINAL TEST RESULTS")
    print("=" * 80)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
    
    if performance_result:
        print("\n🎉 SUCCESS: Recent Transactions API performance test PASSED!")
        print("   ✅ The timeout/performance issues appear to be resolved")
        print("   ✅ API responds within acceptable time limits")
        print("   ✅ Data format is correct for frontend consumption")
    else:
        print("\n❌ FAILURE: Recent Transactions API performance test FAILED!")
        print("   ❌ The timeout/performance issues are NOT resolved")
        print("   ❌ API still has performance problems")
        print("   ❌ Further optimization needed")
    
    print("=" * 80)
    return performance_result

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)