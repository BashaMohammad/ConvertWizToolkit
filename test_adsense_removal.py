#!/usr/bin/env python3
"""
ConvertWiz AdSense Removal Validation Tests
Validates that all AdSense placeholders are removed and UI integrity is preserved
"""

import json
from datetime import datetime

def test_no_adsense_elements():
    """Test 1: Verify no AdSense elements remain in HTML"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    adsense_patterns = [
        'adsbygoogle', 'adsense-placeholder', 'ad-placeholder', 
        'adsense-banner', 'ads-container', 'sidebar-ad-'
    ]
    
    found_elements = []
    for pattern in adsense_patterns:
        if pattern in content:
            found_elements.append(pattern)
    
    return len(found_elements) == 0, found_elements

def test_ui_integrity():
    """Test 2: Check that UI structure and gradients remain intact"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    required_elements = [
        'bg-gradient-to-br from-pink-300 via-purple-400 to-purple-600',  # Main gradient
        'tool-card bg-white rounded-xl',  # Tool cards
        'ConvertWiz - Free Online Conversion Tools',  # Main title
        'tools-categories',  # Tools section structure
        'Image Tools', 'Unit Converters', 'Utility Tools'  # Category headers
    ]
    
    missing_elements = []
    for element in required_elements:
        if element not in content:
            missing_elements.append(element)
    
    return len(missing_elements) == 0, missing_elements

def test_css_cleanup():
    """Test 3: Verify AdSense CSS is removed from style.css"""
    with open('style.css', 'r') as f:
        content = f.read()
    
    adsense_css_patterns = [
        '.adsense-banner', '.adsense-placeholder', '.adsbygoogle', 
        '.ad-placeholder', '.sidebar-ad-'
    ]
    
    found_css = []
    for pattern in adsense_css_patterns:
        if pattern in content:
            found_css.append(pattern)
    
    return len(found_css) == 0, found_css

def test_performance_impact():
    """Test 4: Check file sizes and performance indicators"""
    import os
    
    html_size = os.path.getsize('index.html')
    css_size = os.path.getsize('style.css')
    
    # Check if sizes are reasonable (not too small indicating broken files)
    html_reasonable = html_size > 50000  # At least 50KB
    css_reasonable = css_size > 5000     # At least 5KB
    
    return html_reasonable and css_reasonable, {
        'html_size': html_size,
        'css_size': css_size
    }

def run_validation_tests():
    """Run all validation tests"""
    print("🧪 Running ConvertWiz AdSense Removal Validation Tests...")
    
    test_results = {
        "timestamp": datetime.now().isoformat(),
        "tests": {}
    }
    
    # Test 1: No AdSense Elements
    print("🔍 Test 1: Checking for remaining AdSense elements...")
    no_adsense, found_elements = test_no_adsense_elements()
    test_results["tests"]["no_adsense_elements"] = {
        "status": "PASS" if no_adsense else "FAIL",
        "found_elements": found_elements
    }
    print(f"✅ No AdSense Elements: {'PASS' if no_adsense else 'FAIL'}")
    if found_elements:
        print(f"   Found: {found_elements}")
    
    # Test 2: UI Integrity
    print("🎨 Test 2: Checking UI integrity...")
    ui_intact, missing_elements = test_ui_integrity()
    test_results["tests"]["ui_integrity"] = {
        "status": "PASS" if ui_intact else "FAIL",
        "missing_elements": missing_elements
    }
    print(f"✅ UI Integrity: {'PASS' if ui_intact else 'FAIL'}")
    if missing_elements:
        print(f"   Missing: {missing_elements}")
    
    # Test 3: CSS Cleanup
    print("🎭 Test 3: Checking CSS cleanup...")
    css_clean, found_css = test_css_cleanup()
    test_results["tests"]["css_cleanup"] = {
        "status": "PASS" if css_clean else "FAIL",
        "found_css": found_css
    }
    print(f"✅ CSS Cleanup: {'PASS' if css_clean else 'FAIL'}")
    if found_css:
        print(f"   Found CSS: {found_css}")
    
    # Test 4: Performance Impact
    print("⚡ Test 4: Checking performance impact...")
    perf_ok, perf_data = test_performance_impact()
    test_results["tests"]["performance"] = {
        "status": "PASS" if perf_ok else "FAIL",
        "data": perf_data
    }
    print(f"✅ Performance: {'PASS' if perf_ok else 'FAIL'}")
    print(f"   HTML Size: {perf_data['html_size']} bytes")
    print(f"   CSS Size: {perf_data['css_size']} bytes")
    
    # Overall Result
    all_passed = all(test["status"] == "PASS" for test in test_results["tests"].values())
    test_results["overall_status"] = "PASS" if all_passed else "FAIL"
    
    print("\n" + "="*60)
    print("ADSENSE REMOVAL VALIDATION REPORT")
    print("="*60)
    for test_name, result in test_results["tests"].items():
        print(f"- {test_name.replace('_', ' ').title()}: {result['status']}")
    
    print(f"\n{'🎉 All Tests Passed - Site Ready for AdSense Review' if all_passed else '❌ Some Tests Failed'}")
    
    # Save report
    with open('adsense_removal_test_report.json', 'w') as f:
        json.dump(test_results, f, indent=2)
    
    return all_passed

if __name__ == "__main__":
    success = run_validation_tests()
    exit(0 if success else 1)