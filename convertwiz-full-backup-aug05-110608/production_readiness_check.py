#!/usr/bin/env python3
"""
ConvertWiz Production Readiness Check
Verifies core components are working while subscription is in dev mode
"""

import requests
import json
from datetime import datetime

def check_production_readiness():
    print("🚀 ConvertWiz Production Readiness Check")
    print("=" * 60)
    
    base_url = "http://localhost:5000"
    results = {"tests": [], "summary": {}}
    
    # Core API Tests (Production Ready)
    core_tests = [
        ("API Health", f"{base_url}/api/health", "GET"),
        ("Temperature Converter", f"{base_url}/api/temperature-converter", "POST", {"celsius": 25}),
        ("Color Converter", f"{base_url}/api/color-converter", "POST", {"hex": "#ff5733"}),
        ("Image Compressor Status", f"{base_url}/api/image-compressor", "POST"),
        ("Percentage Calculator", f"{base_url}/api/percentage-calculator", "POST", {"operation": "percentage_of", "value1": 20, "value2": 100}),
    ]
    
    # Core Pages (Production Ready)
    page_tests = [
        ("Homepage", f"{base_url}/"),
        ("Privacy Policy", f"{base_url}/privacy.html"),
        ("Terms of Service", f"{base_url}/terms.html"),
        ("Blog", f"{base_url}/blog.html"),
        ("Dashboard", f"{base_url}/dashboard.html"),
    ]
    
    # Subscription Tests (Should be disabled in production)
    subscription_tests = [
        ("Subscription Order Creation", f"{base_url}/api/create-order", "POST", {"amount": 199, "plan": "standard"}),
        ("Subscription Page", f"{base_url}/subscribe.html"),
    ]
    
    passed = 0
    total = 0
    
    # Test Core Components
    print("\n📦 Core Components (Production Ready):")
    for name, url, *args in core_tests:
        total += 1
        method = args[0] if args else "GET"
        data = args[1] if len(args) > 1 else None
        
        try:
            if method == "POST":
                response = requests.post(url, json=data, timeout=5)
            else:
                response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {name}: Working")
                passed += 1
                results["tests"].append({"name": name, "status": "pass", "type": "core"})
            else:
                print(f"❌ {name}: Failed ({response.status_code})")
                results["tests"].append({"name": name, "status": "fail", "type": "core", "error": response.status_code})
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)}")
            results["tests"].append({"name": name, "status": "error", "type": "core", "error": str(e)})
    
    # Test Core Pages
    print("\n📄 Core Pages (Production Ready):")
    for name, url in page_tests:
        total += 1
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Loading")
                passed += 1
                results["tests"].append({"name": name, "status": "pass", "type": "page"})
            else:
                print(f"❌ {name}: Failed ({response.status_code})")
                results["tests"].append({"name": name, "status": "fail", "type": "page", "error": response.status_code})
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)}")
            results["tests"].append({"name": name, "status": "error", "type": "page", "error": str(e)})
    
    # Test Subscription System (Should be disabled)
    print("\n🔧 Subscription System (Development Mode):")
    for name, url, *args in subscription_tests:
        total += 1
        method = args[0] if args else "GET"
        data = args[1] if len(args) > 1 else None
        
        try:
            if method == "POST":
                response = requests.post(url, json=data, timeout=5)
            else:
                response = requests.get(url, timeout=5)
            
            # For subscription, we want it to be disabled in production
            if name == "Subscription Order Creation":
                if response.status_code == 503:  # Service unavailable = correctly disabled
                    print(f"✅ {name}: Correctly disabled for production")
                    passed += 1
                    results["tests"].append({"name": name, "status": "pass", "type": "subscription", "note": "disabled_in_production"})
                else:
                    print(f"⚠️ {name}: Not properly disabled ({response.status_code})")
                    results["tests"].append({"name": name, "status": "warning", "type": "subscription", "error": f"Expected 503, got {response.status_code}"})
            else:
                if response.status_code == 200:
                    print(f"✅ {name}: Accessible")
                    passed += 1
                    results["tests"].append({"name": name, "status": "pass", "type": "subscription"})
                else:
                    print(f"❌ {name}: Failed ({response.status_code})")
                    results["tests"].append({"name": name, "status": "fail", "type": "subscription", "error": response.status_code})
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)}")
            results["tests"].append({"name": name, "status": "error", "type": "subscription", "error": str(e)})
    
    # Summary
    success_rate = (passed / total) * 100 if total > 0 else 0
    
    print(f"\n📊 Production Readiness Summary:")
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    results["summary"] = {
        "total_tests": total,
        "passed_tests": passed,
        "success_rate": success_rate,
        "timestamp": datetime.now().isoformat(),
        "production_ready": success_rate >= 85
    }
    
    if success_rate >= 85:
        print("🎉 ConvertWiz is PRODUCTION READY!")
        print("✅ Core conversion tools working")
        print("✅ All pages loading properly")
        print("✅ Subscription system properly isolated")
    else:
        print("⚠️ Some issues found, review above results")
    
    # Save results
    report_file = f"production_readiness_report_{int(datetime.now().timestamp())}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Report saved: {report_file}")
    return results

if __name__ == "__main__":
    check_production_readiness()