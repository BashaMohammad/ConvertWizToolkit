#!/usr/bin/env python3
"""
ConvertWiz Production Readiness Test Suite
==========================================
Comprehensive end-to-end testing for production deployment
"""

import requests
import re
import json
from datetime import datetime

class ConvertWizProductionTester:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.test_results = []
        self.critical_issues = []
        
    def log_test(self, test_name, status, details=""):
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{'✅' if status == 'PASS' else '❌'} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
    
    def test_landing_page(self):
        """Test landing page loads correctly"""
        try:
            response = requests.get(self.base_url, timeout=10)
            if response.status_code == 200:
                content = response.text
                # Check for essential elements
                if "ConvertWiz" in content and "Try Now" in content:
                    self.log_test("Landing Page Load", "PASS", f"Status: {response.status_code}")
                else:
                    self.log_test("Landing Page Load", "FAIL", "Missing essential elements")
            else:
                self.log_test("Landing Page Load", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Landing Page Load", "FAIL", str(e))
    
    def test_component_pages(self):
        """Test all component pages load with content"""
        components = [
            "jpg-to-png", "currency-converter", "land-converter", "dp-resizer",
            "word-counter", "distance-converter", "weight-converter", "height-converter",
            "ip-extractor", "qr-generator", "percentage-calculator", "temperature-converter",
            "color-converter", "image-compressor"
        ]
        
        for component in components:
            try:
                response = requests.get(f"{self.base_url}/{component}", timeout=10)
                if response.status_code == 200:
                    content = response.text
                    # Check for component-specific content
                    if f"{component}-section" in content and "Back to Home" in content:
                        self.log_test(f"Component: {component}", "PASS", f"Content length: {len(content)}")
                    else:
                        self.log_test(f"Component: {component}", "FAIL", "Missing component content")
                        self.critical_issues.append(f"Component {component} missing content")
                else:
                    self.log_test(f"Component: {component}", "FAIL", f"Status: {response.status_code}")
                    self.critical_issues.append(f"Component {component} not accessible")
            except Exception as e:
                self.log_test(f"Component: {component}", "FAIL", str(e))
                self.critical_issues.append(f"Component {component} error: {str(e)}")
    
    def test_adsense_banner_cleanup(self):
        """Check for AdSense banner holders that should be removed"""
        try:
            response = requests.get(self.base_url, timeout=10)
            content = response.text
            
            # Search for AdSense-related elements
            adsense_patterns = [
                r'adsbygoogle',
                r'adsense-placeholder',
                r'ad-placeholder',
                r'data-ad-client',
                r'google_ad_',
                r'adsense-banner'
            ]
            
            found_adsense = []
            for pattern in adsense_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    found_adsense.extend(matches)
            
            if found_adsense:
                self.log_test("AdSense Banner Cleanup", "FAIL", f"Found: {found_adsense}")
                self.critical_issues.append(f"AdSense elements still present: {found_adsense}")
            else:
                self.log_test("AdSense Banner Cleanup", "PASS", "No AdSense elements found")
                
        except Exception as e:
            self.log_test("AdSense Banner Cleanup", "FAIL", str(e))
    
    def test_navigation_functionality(self):
        """Test navigation and JavaScript functionality"""
        try:
            response = requests.get(self.base_url, timeout=10)
            content = response.text
            
            # Check for emergency component fix
            if "emergency_component_fix.js" in content:
                self.log_test("Navigation Script", "PASS", "Emergency component fix loaded")
            else:
                self.log_test("Navigation Script", "FAIL", "Missing navigation script")
                self.critical_issues.append("Navigation script not loaded")
            
            # Check for data-target attributes
            data_targets = re.findall(r'data-target="([^"]+)"', content)
            if len(data_targets) > 10:  # Should have many navigation buttons
                self.log_test("Navigation Buttons", "PASS", f"Found {len(data_targets)} navigation elements")
            else:
                self.log_test("Navigation Buttons", "FAIL", f"Only {len(data_targets)} navigation elements")
                
        except Exception as e:
            self.log_test("Navigation Functionality", "FAIL", str(e))
    
    def test_css_structure(self):
        """Test CSS structure and component isolation"""
        try:
            response = requests.get(f"{self.base_url}/style.css", timeout=10)
            if response.status_code == 200:
                css_content = response.text
                
                # Check for component isolation rules
                if ".tool-section" in css_content and ".tool-section.active" in css_content:
                    self.log_test("CSS Component Isolation", "PASS", "Component isolation rules present")
                else:
                    self.log_test("CSS Component Isolation", "FAIL", "Missing component isolation")
                    self.critical_issues.append("CSS component isolation missing")
                    
                # Check for !important overrides that could cause issues
                important_count = css_content.count("!important")
                if important_count < 5:  # Should be minimal
                    self.log_test("CSS Important Rules", "PASS", f"Minimal !important usage: {important_count}")
                else:
                    self.log_test("CSS Important Rules", "WARNING", f"High !important usage: {important_count}")
                    
            else:
                self.log_test("CSS Structure", "FAIL", f"CSS not accessible: {response.status_code}")
        except Exception as e:
            self.log_test("CSS Structure", "FAIL", str(e))
    
    def test_server_health(self):
        """Test server health and API endpoints"""
        try:
            # Test health endpoint
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                self.log_test("Server Health", "PASS", "Health endpoint responding")
            else:
                self.log_test("Server Health", "FAIL", f"Health endpoint status: {response.status_code}")
        except Exception as e:
            self.log_test("Server Health", "FAIL", str(e))
    
    def test_mobile_responsiveness(self):
        """Test mobile-specific elements"""
        try:
            response = requests.get(self.base_url, timeout=10)
            content = response.text
            
            # Check for mobile viewport
            if 'viewport' in content and 'mobile' in content.lower():
                self.log_test("Mobile Viewport", "PASS", "Mobile viewport meta tag present")
            else:
                self.log_test("Mobile Viewport", "FAIL", "Missing mobile viewport")
            
            # Check for responsive classes
            if 'md:' in content and 'lg:' in content:
                self.log_test("Responsive Design", "PASS", "Tailwind responsive classes present")
            else:
                self.log_test("Responsive Design", "WARNING", "Limited responsive classes")
                
        except Exception as e:
            self.log_test("Mobile Responsiveness", "FAIL", str(e))
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting ConvertWiz Production Readiness Tests")
        print("=" * 60)
        
        self.test_landing_page()
        self.test_component_pages()
        self.test_adsense_banner_cleanup()
        self.test_navigation_functionality()
        self.test_css_structure()
        self.test_server_health()
        self.test_mobile_responsiveness()
        
        # Generate summary
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["status"] == "PASS"])
        failed_tests = len([t for t in self.test_results if t["status"] == "FAIL"])
        warnings = len([t for t in self.test_results if t["status"] == "WARNING"])
        
        print("\n" + "=" * 60)
        print("📊 PRODUCTION TEST RESULTS")
        print(f"   Total Tests: {total_tests}")
        print(f"   ✅ Passed: {passed_tests}")
        print(f"   ❌ Failed: {failed_tests}")
        print(f"   ⚠️  Warnings: {warnings}")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.critical_issues:
            print("\n🚨 CRITICAL ISSUES FOUND:")
            for issue in self.critical_issues:
                print(f"   - {issue}")
        else:
            print("\n✅ NO CRITICAL ISSUES FOUND")
        
        # Save detailed results
        with open(f"production_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", "w") as f:
            json.dump({
                "summary": {
                    "total": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "warnings": warnings,
                    "success_rate": (passed_tests/total_tests)*100
                },
                "critical_issues": self.critical_issues,
                "detailed_results": self.test_results
            }, f, indent=2)
        
        return failed_tests == 0 and len(self.critical_issues) == 0

if __name__ == "__main__":
    tester = ConvertWizProductionTester()
    production_ready = tester.run_all_tests()
    
    if production_ready:
        print("\n🎉 PRODUCTION READY: All tests passed!")
    else:
        print("\n⚠️  PRODUCTION ISSUES: Review and fix critical issues before deployment")