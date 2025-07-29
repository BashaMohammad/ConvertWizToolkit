#!/usr/bin/env python3
"""
ConvertWiz Legal Pages Validation Test
Validates AdSense compliance updates for privacy.html and terms.html
"""

import json
import time
from datetime import datetime

def check_adsense_sections():
    """Check for presence of AdSense sections in both pages"""
    results = {"privacy": False, "terms": False}
    
    try:
        with open('privacy.html', 'r') as f:
            privacy_content = f.read()
            if "Google AdSense" in privacy_content and "advertising cookies" in privacy_content:
                results["privacy"] = True
                
        with open('terms.html', 'r') as f:
            terms_content = f.read()
            if "Advertising & Monetization" in terms_content and "third-party advertisements" in terms_content:
                results["terms"] = True
                
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        return False
        
    return results["privacy"] and results["terms"]

def validate_links():
    """Validate external links in AdSense sections"""
    expected_links = [
        "https://www.google.com/settings/ads/",
        "https://www.aboutads.info/", 
        "https://policies.google.com/technologies/ads"
    ]
    
    links_found = 0
    try:
        with open('privacy.html', 'r') as f:
            privacy_content = f.read()
        with open('terms.html', 'r') as f:
            terms_content = f.read()
            
        combined_content = privacy_content + terms_content
        
        for link in expected_links:
            if link in combined_content:
                links_found += 1
                
    except FileNotFoundError:
        return False
        
    return links_found == len(expected_links)

def check_last_updated():
    """Check for Last Updated dates"""
    try:
        with open('privacy.html', 'r') as f:
            privacy_content = f.read()
        with open('terms.html', 'r') as f:
            terms_content = f.read()
            
        privacy_updated = "Last Updated: July 29, 2025" in privacy_content
        terms_updated = "Last Updated: July 29, 2025" in terms_content
        
        return privacy_updated and terms_updated
        
    except FileNotFoundError:
        return False

def run_validation_tests():
    """Run all validation tests"""
    print("🚀 Starting ConvertWiz Legal Pages Validation...")
    
    test_results = {
        "timestamp": datetime.now().isoformat(),
        "tests": {}
    }
    
    # Test 1: AdSense Sections Present
    print("🔍 Checking AdSense sections...")
    adsense_check = check_adsense_sections()
    test_results["tests"]["adsense_sections"] = "PASS" if adsense_check else "FAIL"
    print(f"✅ AdSense Sections: {'PASS' if adsense_check else 'FAIL'}")
    
    # Test 2: External Links Validation
    print("🔗 Validating external links...")
    links_check = validate_links()
    test_results["tests"]["external_links"] = "PASS" if links_check else "FAIL"
    print(f"✅ External Links: {'PASS' if links_check else 'FAIL'}")
    
    # Test 3: Last Updated Dates
    print("📅 Checking Last Updated dates...")
    dates_check = check_last_updated()
    test_results["tests"]["last_updated"] = "PASS" if dates_check else "FAIL"
    print(f"✅ Last Updated Dates: {'PASS' if dates_check else 'FAIL'}")
    
    # Overall Result
    all_passed = all(result == "PASS" for result in test_results["tests"].values())
    test_results["overall_status"] = "PASS" if all_passed else "FAIL"
    
    print("\n" + "="*50)
    print("LEGAL PAGES VALIDATION REPORT")
    print("="*50)
    for test, result in test_results["tests"].items():
        print(f"- {test.replace('_', ' ').title()}: {result}")
    print(f"\n{'✅ All Tests Passed' if all_passed else '❌ Some Tests Failed'}")
    
    # Save report
    with open('legal_validation_report.json', 'w') as f:
        json.dump(test_results, f, indent=2)
    
    return all_passed

if __name__ == "__main__":
    success = run_validation_tests()
    exit(0 if success else 1)