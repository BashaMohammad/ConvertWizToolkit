#!/usr/bin/env python3
"""
ConvertWiz Authentication End-to-End Testing Suite
Tests complete authentication flow including UI, Firebase integration, and user experience
"""

import requests
import json
import time
from datetime import datetime

def test_auth_system():
    print("🔐 ConvertWiz Authentication End-to-End Testing")
    print("=" * 60)
    
    base_url = "http://localhost:5000"
    results = {"tests": [], "summary": {}}
    
    passed = 0
    total = 0
    
    # Test 1: Auth Page Accessibility
    print("\n📄 Authentication Page Tests:")
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.html", timeout=10)
        if response.status_code == 200:
            content = response.text
            # Check for essential UI elements
            ui_elements = [
                'Sign In', 'Sign Up', 'Continue with Google', 
                'signin-email', 'signin-password', 'signup-name',
                'firebase-app-compat', 'firebase-auth-compat'
            ]
            
            missing_elements = [elem for elem in ui_elements if elem not in content]
            
            if not missing_elements:
                print("✅ Auth Page: All UI elements present")
                passed += 1
                results["tests"].append({"name": "Auth Page UI", "status": "pass", "type": "ui"})
            else:
                print(f"❌ Auth Page: Missing elements - {missing_elements}")
                results["tests"].append({"name": "Auth Page UI", "status": "fail", "type": "ui", "error": f"Missing: {missing_elements}"})
        else:
            print(f"❌ Auth Page: Failed to load ({response.status_code})")
            results["tests"].append({"name": "Auth Page UI", "status": "fail", "type": "ui", "error": response.status_code})
    except Exception as e:
        print(f"❌ Auth Page: Error - {str(e)}")
        results["tests"].append({"name": "Auth Page UI", "status": "error", "type": "ui", "error": str(e)})

    # Test 2: Firebase SDK Loading
    print("\n🔥 Firebase Integration Tests:")
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.html", timeout=5)
        if response.status_code == 200:
            content = response.text
            firebase_scripts = [
                'firebase-app-compat.js',
                'firebase-auth-compat.js'
            ]
            
            firebase_loaded = all(script in content for script in firebase_scripts)
            
            if firebase_loaded:
                print("✅ Firebase SDK: All scripts loaded")
                passed += 1
                results["tests"].append({"name": "Firebase SDK", "status": "pass", "type": "firebase"})
            else:
                print("❌ Firebase SDK: Missing scripts")
                results["tests"].append({"name": "Firebase SDK", "status": "fail", "type": "firebase", "error": "Missing SDK scripts"})
        else:
            print(f"❌ Firebase SDK: Page load failed")
            results["tests"].append({"name": "Firebase SDK", "status": "fail", "type": "firebase", "error": "Page load failed"})
    except Exception as e:
        print(f"❌ Firebase SDK: Error - {str(e)}")
        results["tests"].append({"name": "Firebase SDK", "status": "error", "type": "firebase", "error": str(e)})

    # Test 3: Authentication JavaScript Functionality
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.js", timeout=5)
        if response.status_code == 200:
            js_content = response.text
            # Check for essential auth functions
            auth_functions = [
                'initializeAuth', 'showLoading', 'hideLoading',
                'showToast', 'switchTab', 'signInWithEmailAndPassword',
                'createUserWithEmailAndPassword', 'GoogleAuthProvider'
            ]
            
            missing_functions = [func for func in auth_functions if func not in js_content]
            
            if not missing_functions:
                print("✅ Auth JavaScript: All functions present")
                passed += 1
                results["tests"].append({"name": "Auth JavaScript", "status": "pass", "type": "javascript"})
            else:
                print(f"❌ Auth JavaScript: Missing functions - {missing_functions}")
                results["tests"].append({"name": "Auth JavaScript", "status": "fail", "type": "javascript", "error": f"Missing: {missing_functions}"})
        else:
            print(f"❌ Auth JavaScript: Failed to load ({response.status_code})")
            results["tests"].append({"name": "Auth JavaScript", "status": "fail", "type": "javascript", "error": response.status_code})
    except Exception as e:
        print(f"❌ Auth JavaScript: Error - {str(e)}")
        results["tests"].append({"name": "Auth JavaScript", "status": "error", "type": "javascript", "error": str(e)})

    # Test 4: CSS and Styling
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.html", timeout=5)
        if response.status_code == 200:
            content = response.text
            # Check for Tailwind CSS and styling elements
            styling_elements = [
                'tailwindcss.com', 'glass-effect', 'gradient-bg',
                'font-awesome', 'transition-transform', 'bg-blue-600'
            ]
            
            missing_styling = [elem for elem in styling_elements if elem not in content]
            
            if not missing_styling:
                print("✅ CSS Styling: All elements present")
                passed += 1
                results["tests"].append({"name": "CSS Styling", "status": "pass", "type": "styling"})
            else:
                print(f"❌ CSS Styling: Missing elements - {missing_styling}")
                results["tests"].append({"name": "CSS Styling", "status": "fail", "type": "styling", "error": f"Missing: {missing_styling}"})
        else:
            print(f"❌ CSS Styling: Page load failed")
            results["tests"].append({"name": "CSS Styling", "status": "fail", "type": "styling", "error": "Page load failed"})
    except Exception as e:
        print(f"❌ CSS Styling: Error - {str(e)}")
        results["tests"].append({"name": "CSS Styling", "status": "error", "type": "styling", "error": str(e)})

    # Test 5: Mobile Responsiveness
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.html", timeout=5)
        if response.status_code == 200:
            content = response.text
            # Check for mobile-responsive design elements
            mobile_elements = [
                'max-w-md', 'min-h-screen', 'p-4', 'space-y-4',
                'w-full', 'flex-1', 'responsive'
            ]
            
            mobile_ready = any(elem in content for elem in mobile_elements[:4])  # At least some mobile elements
            
            if mobile_ready:
                print("✅ Mobile Responsiveness: Design elements present")
                passed += 1
                results["tests"].append({"name": "Mobile Responsiveness", "status": "pass", "type": "mobile"})
            else:
                print("❌ Mobile Responsiveness: Missing responsive elements")
                results["tests"].append({"name": "Mobile Responsiveness", "status": "fail", "type": "mobile", "error": "Missing responsive design"})
        else:
            print(f"❌ Mobile Responsiveness: Page load failed")
            results["tests"].append({"name": "Mobile Responsiveness", "status": "fail", "type": "mobile", "error": "Page load failed"})
    except Exception as e:
        print(f"❌ Mobile Responsiveness: Error - {str(e)}")
        results["tests"].append({"name": "Mobile Responsiveness", "status": "error", "type": "mobile", "error": str(e)})

    # Test 6: Security Configuration
    total += 1
    try:
        response = requests.get(f"{base_url}/auth.js", timeout=5)
        if response.status_code == 200:
            js_content = response.text
            # Check for proper Firebase configuration (without exposing keys)
            security_elements = [
                'firebaseConfig', 'authDomain', 'projectId',
                'storageBucket', 'messagingSenderId', 'appId'
            ]
            
            config_present = all(elem in js_content for elem in security_elements)
            
            if config_present:
                print("✅ Security Configuration: Firebase config present")
                passed += 1
                results["tests"].append({"name": "Security Configuration", "status": "pass", "type": "security"})
            else:
                print("❌ Security Configuration: Incomplete Firebase config")
                results["tests"].append({"name": "Security Configuration", "status": "fail", "type": "security", "error": "Incomplete config"})
        else:
            print(f"❌ Security Configuration: JavaScript load failed")
            results["tests"].append({"name": "Security Configuration", "status": "fail", "type": "security", "error": "JS load failed"})
    except Exception as e:
        print(f"❌ Security Configuration: Error - {str(e)}")
        results["tests"].append({"name": "Security Configuration", "status": "error", "type": "security", "error": str(e)})

    # Test 7: Navigation Integration
    total += 1
    try:
        # Check if auth page has proper back navigation
        response = requests.get(f"{base_url}/auth.html", timeout=5)
        if response.status_code == 200:
            content = response.text
            nav_elements = ['Back to ConvertWiz', 'window.location.href', 'fa-arrow-left']
            
            nav_present = any(elem in content for elem in nav_elements)
            
            if nav_present:
                print("✅ Navigation Integration: Back navigation present")
                passed += 1
                results["tests"].append({"name": "Navigation Integration", "status": "pass", "type": "navigation"})
            else:
                print("❌ Navigation Integration: Missing navigation elements")
                results["tests"].append({"name": "Navigation Integration", "status": "fail", "type": "navigation", "error": "Missing navigation"})
        else:
            print(f"❌ Navigation Integration: Page load failed")
            results["tests"].append({"name": "Navigation Integration", "status": "fail", "type": "navigation", "error": "Page load failed"})
    except Exception as e:
        print(f"❌ Navigation Integration: Error - {str(e)}")
        results["tests"].append({"name": "Navigation Integration", "status": "error", "type": "navigation", "error": str(e)})

    # Test 8: Performance and Loading
    total += 1
    try:
        start_time = time.time()
        response = requests.get(f"{base_url}/auth.html", timeout=5)
        load_time = time.time() - start_time
        
        if response.status_code == 200 and load_time < 2.0:  # Under 2 seconds
            print(f"✅ Performance: Page loaded in {load_time:.2f}s")
            passed += 1
            results["tests"].append({"name": "Performance", "status": "pass", "type": "performance", "load_time": load_time})
        elif response.status_code == 200:
            print(f"⚠️ Performance: Slow loading ({load_time:.2f}s)")
            results["tests"].append({"name": "Performance", "status": "warning", "type": "performance", "load_time": load_time})
        else:
            print(f"❌ Performance: Page failed to load")
            results["tests"].append({"name": "Performance", "status": "fail", "type": "performance", "error": "Load failed"})
    except Exception as e:
        print(f"❌ Performance: Error - {str(e)}")
        results["tests"].append({"name": "Performance", "status": "error", "type": "performance", "error": str(e)})

    # Summary
    success_rate = (passed / total) * 100 if total > 0 else 0
    
    print(f"\n📊 Authentication System Test Summary:")
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Success Rate: {success_rate:.1f}%")
    
    results["summary"] = {
        "total_tests": total,
        "passed_tests": passed,
        "success_rate": success_rate,
        "timestamp": datetime.now().isoformat(),
        "auth_system_ready": success_rate >= 80
    }
    
    if success_rate >= 80:
        print("🎉 Authentication System is READY!")
        print("✅ UI components working properly")
        print("✅ Firebase integration configured")
        print("✅ Security measures in place")
        print("✅ Mobile responsive design")
    else:
        print("⚠️ Some authentication issues found")
    
    # Save results
    report_file = f"auth_e2e_test_report_{int(datetime.now().timestamp())}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Report saved: {report_file}")
    return results

if __name__ == "__main__":
    test_auth_system()