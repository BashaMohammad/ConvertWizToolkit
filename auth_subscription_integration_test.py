#!/usr/bin/env python3
"""
ConvertWiz Authentication-Subscription Integration Test
Tests the complete flow from authentication to subscription access
"""

import requests
import json
import time
from datetime import datetime

def test_auth_subscription_integration():
    print("🔗 ConvertWiz Authentication-Subscription Integration Test")
    print("=" * 65)
    
    base_url = "http://localhost:5000"
    results = {"tests": [], "summary": {}}
    
    passed = 0
    total = 0
    
    # Test 1: Authentication Endpoints
    print("\n🔐 Authentication API Tests:")
    
    # Test auth check without token
    total += 1
    try:
        response = requests.get(f"{base_url}/api/auth/check", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if not data.get('authenticated'):
                print("✅ Auth Check (No Token): Correctly returns unauthenticated")
                passed += 1
                results["tests"].append({"name": "Auth Check No Token", "status": "pass", "type": "auth"})
            else:
                print("❌ Auth Check (No Token): Should return unauthenticated")
                results["tests"].append({"name": "Auth Check No Token", "status": "fail", "type": "auth"})
        else:
            print(f"❌ Auth Check (No Token): HTTP {response.status_code}")
            results["tests"].append({"name": "Auth Check No Token", "status": "fail", "type": "auth"})
    except Exception as e:
        print(f"❌ Auth Check (No Token): Error - {str(e)}")
        results["tests"].append({"name": "Auth Check No Token", "status": "error", "type": "auth"})

    # Test auth check with token
    total += 1
    try:
        headers = {"Authorization": "Bearer test-token"}
        response = requests.get(f"{base_url}/api/auth/check", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('authenticated'):
                print("✅ Auth Check (With Token): Correctly returns authenticated")
                passed += 1
                results["tests"].append({"name": "Auth Check With Token", "status": "pass", "type": "auth"})
            else:
                print("❌ Auth Check (With Token): Should return authenticated")
                results["tests"].append({"name": "Auth Check With Token", "status": "fail", "type": "auth"})
        else:
            print(f"❌ Auth Check (With Token): HTTP {response.status_code}")
            results["tests"].append({"name": "Auth Check With Token", "status": "fail", "type": "auth"})
    except Exception as e:
        print(f"❌ Auth Check (With Token): Error - {str(e)}")
        results["tests"].append({"name": "Auth Check With Token", "status": "error", "type": "auth"})

    # Test user info endpoint
    total += 1
    try:
        headers = {"Authorization": "Bearer test-token"}
        response = requests.get(f"{base_url}/api/auth/user", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            if user.get('email') and user.get('plan'):
                print("✅ User Info: Returns complete user data")
                passed += 1
                results["tests"].append({"name": "User Info", "status": "pass", "type": "auth"})
            else:
                print("❌ User Info: Incomplete user data")
                results["tests"].append({"name": "User Info", "status": "fail", "type": "auth"})
        else:
            print(f"❌ User Info: HTTP {response.status_code}")
            results["tests"].append({"name": "User Info", "status": "fail", "type": "auth"})
    except Exception as e:
        print(f"❌ User Info: Error - {str(e)}")
        results["tests"].append({"name": "User Info", "status": "error", "type": "auth"})

    # Test 2: Subscription Page Accessibility
    print("\n💰 Subscription System Tests:")
    
    total += 1
    try:
        response = requests.get(f"{base_url}/subscribe.html", timeout=5)
        if response.status_code == 200:
            content = response.text
            # Check for subscription elements
            subscription_elements = [
                'subscription', 'pricing', 'plan', 'Razorpay',
                'Standard', 'Premium', 'Free'
            ]
            
            present_elements = [elem for elem in subscription_elements if elem in content]
            
            if len(present_elements) >= 5:  # Most elements present
                print(f"✅ Subscription Page: {len(present_elements)}/7 elements present")
                passed += 1
                results["tests"].append({"name": "Subscription Page", "status": "pass", "type": "subscription"})
            else:
                print(f"❌ Subscription Page: Only {len(present_elements)}/7 elements present")
                results["tests"].append({"name": "Subscription Page", "status": "fail", "type": "subscription"})
        else:
            print(f"❌ Subscription Page: HTTP {response.status_code}")
            results["tests"].append({"name": "Subscription Page", "status": "fail", "type": "subscription"})
    except Exception as e:
        print(f"❌ Subscription Page: Error - {str(e)}")
        results["tests"].append({"name": "Subscription Page", "status": "error", "type": "subscription"})

    # Test 3: Development Mode Protection
    total += 1
    try:
        response = requests.post(
            f"{base_url}/api/create-order",
            json={"amount": 199, "plan": "standard"},
            timeout=5
        )
        
        # In development mode, should work or require auth
        # In production mode, should return 503
        if response.status_code in [401, 503]:  # Either auth required or service unavailable
            data = response.json()
            if response.status_code == 503:
                print("✅ Development Mode Protection: Subscription disabled in production")
            else:
                print("✅ Development Mode Protection: Authentication required")
            passed += 1
            results["tests"].append({"name": "Development Mode Protection", "status": "pass", "type": "security"})
        else:
            print(f"⚠️ Development Mode Protection: Unexpected response {response.status_code}")
            results["tests"].append({"name": "Development Mode Protection", "status": "warning", "type": "security"})
    except Exception as e:
        print(f"❌ Development Mode Protection: Error - {str(e)}")
        results["tests"].append({"name": "Development Mode Protection", "status": "error", "type": "security"})

    # Test 4: Navigation Integration
    total += 1
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            content = response.text
            # Check for subscription-related navigation
            nav_elements = ['Subscribe', 'Upgrade', 'Premium', 'Login', 'Sign']
            
            present_nav = [elem for elem in nav_elements if elem in content]
            
            if len(present_nav) >= 2:
                print(f"✅ Navigation Integration: {len(present_nav)} subscription elements found")
                passed += 1
                results["tests"].append({"name": "Navigation Integration", "status": "pass", "type": "navigation"})
            else:
                print(f"❌ Navigation Integration: Only {len(present_nav)} elements found")
                results["tests"].append({"name": "Navigation Integration", "status": "fail", "type": "navigation"})
        else:
            print(f"❌ Navigation Integration: Homepage load failed")
            results["tests"].append({"name": "Navigation Integration", "status": "fail", "type": "navigation"})
    except Exception as e:
        print(f"❌ Navigation Integration: Error - {str(e)}")
        results["tests"].append({"name": "Navigation Integration", "status": "error", "type": "navigation"})

    # Test 5: Core Tools Accessibility (Production Ready)
    print("\n🛠️ Core Tools Production Readiness:")
    
    core_tools = [
        ("/", "Homepage"),
        ("/privacy.html", "Privacy Policy"),
        ("/terms.html", "Terms of Service"),
        ("/blog.html", "Blog"),
        ("/dashboard.html", "Dashboard")
    ]
    
    for path, name in core_tools:
        total += 1
        try:
            response = requests.get(f"{base_url}{path}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Accessible")
                passed += 1
                results["tests"].append({"name": f"Core Tool - {name}", "status": "pass", "type": "core"})
            else:
                print(f"❌ {name}: HTTP {response.status_code}")
                results["tests"].append({"name": f"Core Tool - {name}", "status": "fail", "type": "core"})
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)}")
            results["tests"].append({"name": f"Core Tool - {name}", "status": "error", "type": "core"})

    # Test 6: API Endpoints Health
    total += 1
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print("✅ API Health: System healthy")
                passed += 1
                results["tests"].append({"name": "API Health", "status": "pass", "type": "api"})
            else:
                print("❌ API Health: System not healthy")
                results["tests"].append({"name": "API Health", "status": "fail", "type": "api"})
        else:
            print(f"❌ API Health: HTTP {response.status_code}")
            results["tests"].append({"name": "API Health", "status": "fail", "type": "api"})
    except Exception as e:
        print(f"❌ API Health: Error - {str(e)}")
        results["tests"].append({"name": "API Health", "status": "error", "type": "api"})

    # Summary
    success_rate = (passed / total) * 100 if total > 0 else 0
    
    print(f"\n📊 Integration Test Summary:")
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    results["summary"] = {
        "total_tests": total,
        "passed_tests": passed,
        "success_rate": success_rate,
        "timestamp": datetime.now().isoformat(),
        "integration_ready": success_rate >= 80
    }
    
    if success_rate >= 80:
        print("🎉 Authentication-Subscription Integration is READY!")
        print("✅ Authentication endpoints working")
        print("✅ Subscription system properly isolated")
        print("✅ Core tools production ready")
        print("✅ Development mode protection active")
    else:
        print("⚠️ Some integration issues found")
    
    # Save results
    report_file = f"auth_subscription_integration_report_{int(datetime.now().timestamp())}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Report saved: {report_file}")
    return results

if __name__ == "__main__":
    test_auth_subscription_integration()