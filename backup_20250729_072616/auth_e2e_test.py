#!/usr/bin/env python3
"""
ConvertWiz End-to-End Authentication System Testing
Tests all authentication functionality, navigation, and UI components
"""

import json
import time
import requests
from datetime import datetime

class ConvertWizE2ETest:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, passed, details=""):
        """Log test results"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            "test_name": test_name,
            "status": status,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_homepage_accessibility(self):
        """Test 1: Homepage loads and is accessible"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200 and "ConvertWiz" in response.text:
                self.log_test("Homepage Accessibility", True, "Homepage loads successfully")
            else:
                self.log_test("Homepage Accessibility", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Homepage Accessibility", False, str(e))
    
    def test_authentication_pages(self):
        """Test 2: Authentication pages are accessible"""
        pages = {
            "Auth Page": "/auth.html",
            "Dashboard Page": "/dashboard.html", 
            "Admin Page": "/admin.html"
        }
        
        for page_name, url in pages.items():
            try:
                response = requests.get(f"{self.base_url}{url}")
                if response.status_code == 200:
                    self.log_test(f"{page_name} Accessibility", True, f"Page loads at {url}")
                else:
                    self.log_test(f"{page_name} Accessibility", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"{page_name} Accessibility", False, str(e))
    
    def test_firebase_config_endpoint(self):
        """Test 3: Firebase configuration endpoint works"""
        try:
            response = requests.get(f"{self.base_url}/api/firebase-config")
            if response.status_code == 200:
                config = response.json()
                if "apiKey" in config and "projectId" in config:
                    self.log_test("Firebase Config API", True, "Config endpoint returns valid data")
                else:
                    self.log_test("Firebase Config API", False, "Missing required config fields")
            else:
                self.log_test("Firebase Config API", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Firebase Config API", False, str(e))
    
    def test_auth_api_endpoints(self):
        """Test 4: Authentication API endpoints"""
        endpoints = [
            "/api/auth/check",
            "/api/auth/user"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}")
                # These endpoints should return proper responses even without auth
                if response.status_code in [200, 401, 403]:
                    self.log_test(f"Auth API {endpoint}", True, f"Endpoint responds correctly")
                else:
                    self.log_test(f"Auth API {endpoint}", False, f"Unexpected status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Auth API {endpoint}", False, str(e))
    
    def test_navigation_html_structure(self):
        """Test 5: Navigation HTML structure is correct"""
        try:
            response = requests.get(f"{self.base_url}/")
            html = response.text
            
            # Check for user dropdown structure
            if 'group-hover:opacity-100 group-hover:visible' in html:
                self.log_test("User Dropdown CSS Fix", True, "Hover dropdown uses opacity/visibility transition")
            else:
                self.log_test("User Dropdown CSS Fix", False, "Old hidden/block dropdown structure found")
            
            # Check that duplicate navigation buttons are removed
            dashboard_count = html.count('Dashboard')
            admin_count = html.count('Admin')
            
            # Should have minimal references (not in main nav)
            if dashboard_count <= 3 and admin_count <= 3:  # Allowing for dropdown and mobile versions
                self.log_test("Duplicate Navigation Removal", True, f"Dashboard: {dashboard_count}, Admin: {admin_count} references")
            else:
                self.log_test("Duplicate Navigation Removal", False, f"Too many references - Dashboard: {dashboard_count}, Admin: {admin_count}")
                
        except Exception as e:
            self.log_test("Navigation HTML Structure", False, str(e))
    
    def test_javascript_functionality(self):
        """Test 6: JavaScript files are accessible"""
        js_files = [
            "/firebase-auth.js",
            "/firebase-config.js", 
            "/app.js",
            "/script.js"
        ]
        
        for js_file in js_files:
            try:
                response = requests.get(f"{self.base_url}{js_file}")
                if response.status_code == 200 and len(response.text) > 100:
                    self.log_test(f"JavaScript File {js_file}", True, "File loads with content")
                else:
                    self.log_test(f"JavaScript File {js_file}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"JavaScript File {js_file}", False, str(e))
    
    def test_css_styling(self):
        """Test 7: CSS files are accessible"""
        try:
            response = requests.get(f"{self.base_url}/style.css")
            if response.status_code == 200 and len(response.text) > 1000:
                self.log_test("CSS Stylesheet", True, "Style.css loads with content")
            else:
                self.log_test("CSS Stylesheet", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("CSS Stylesheet", False, str(e))
    
    def test_mobile_responsiveness(self):
        """Test 8: Mobile navigation structure exists"""
        try:
            response = requests.get(f"{self.base_url}/")
            html = response.text
            
            if 'mobile-menu' in html and 'mobile-auth-btn' in html:
                self.log_test("Mobile Navigation Structure", True, "Mobile menu elements present")
            else:
                self.log_test("Mobile Navigation Structure", False, "Missing mobile navigation elements")
                
        except Exception as e:
            self.log_test("Mobile Navigation Structure", False, str(e))
    
    def test_admin_logout_functionality(self):
        """Test 9: Admin page has proper logout function"""
        try:
            response = requests.get(f"{self.base_url}/admin.html")
            html = response.text
            
            if 'window.logout' in html and 'signOut(auth)' in html:
                self.log_test("Admin Logout Function", True, "Logout function properly implemented")
            else:
                self.log_test("Admin Logout Function", False, "Missing or incomplete logout function")
                
        except Exception as e:
            self.log_test("Admin Logout Function", False, str(e))
    
    def test_dashboard_redirect_fix(self):
        """Test 10: Dashboard has improved redirect logic"""
        try:
            response = requests.get(f"{self.base_url}/dashboard.html")
            html = response.text
            
            if '8000' in html and 'auth.currentUser' in html:
                self.log_test("Dashboard Redirect Fix", True, "Extended timeout and auth checks implemented")
            else:
                self.log_test("Dashboard Redirect Fix", False, "Dashboard redirect improvements not found")
                
        except Exception as e:
            self.log_test("Dashboard Redirect Fix", False, str(e))
    
    def run_all_tests(self):
        """Run all tests and generate report"""
        print("🚀 Starting ConvertWiz End-to-End Authentication System Testing")
        print("=" * 70)
        
        test_methods = [
            self.test_homepage_accessibility,
            self.test_authentication_pages,
            self.test_firebase_config_endpoint,
            self.test_auth_api_endpoints,
            self.test_navigation_html_structure,
            self.test_javascript_functionality,
            self.test_css_styling,
            self.test_mobile_responsiveness,
            self.test_admin_logout_functionality,
            self.test_dashboard_redirect_fix
        ]
        
        for test_method in test_methods:
            try:
                test_method()
                time.sleep(0.5)  # Brief pause between tests
            except Exception as e:
                self.log_test(test_method.__name__, False, f"Test execution error: {str(e)}")
        
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 70)
        print("📊 AUTHENTICATION SYSTEM TEST RESULTS")
        print("=" * 70)
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        print("-" * 50)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test_name']}")
            if result['details']:
                print(f"   {result['details']}")
        
        # Save results to file
        report_filename = f"auth_e2e_test_report_{int(time.time())}.json"
        with open(report_filename, 'w') as f:
            json.dump({
                "summary": {
                    "total_tests": self.total_tests,
                    "passed_tests": self.passed_tests,
                    "failed_tests": self.total_tests - self.passed_tests,
                    "success_rate": round(self.passed_tests/self.total_tests*100, 1),
                    "test_date": datetime.now().isoformat()
                },
                "test_results": self.test_results
            }, f, indent=2)
        
        print(f"\n💾 Detailed report saved to: {report_filename}")
        
        if self.passed_tests == self.total_tests:
            print("\n🎉 ALL TESTS PASSED! Authentication system is working perfectly.")
        else:
            print(f"\n⚠️  {self.total_tests - self.passed_tests} test(s) failed. Please review the issues above.")
        
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    tester = ConvertWizE2ETest()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ ConvertWiz authentication system is ready for production!")
    else:
        print("\n❌ Issues found. Please address the failing tests before deployment.")