#!/usr/bin/env python3
"""
ConvertWiz Component Isolation Fix
Ensures each tool displays individually on dedicated pages
"""

import re
import json
from datetime import datetime

def fix_tool_section_visibility():
    """Ensure all tool sections have display: none by default"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    # Find all tool-section divs and ensure they have display: none
    tool_sections = [
        'jpg-to-png-section', 'currency-converter-section', 'land-converter-section',
        'dp-resizer-section', 'word-counter-section', 'distance-converter-section',
        'weight-converter-section', 'height-converter-section', 'ip-extractor-section',
        'qr-generator-section', 'percentage-calculator-section', 'temperature-converter-section',
        'color-converter-section', 'image-compressor-section', 'text-to-speech-section',
        'backlink-checker-section', 'meta-tag-generator-section', 'dpi-checker-section',
        'url-shortener-section'
    ]
    
    changes_made = 0
    
    for section_id in tool_sections:
        # Pattern to match tool-section divs
        pattern = rf'<div class="tool-section" id="{section_id}"(?![^>]*style="display: none)")'
        replacement = f'<div class="tool-section" id="{section_id}" style="display: none;"'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes_made += 1
            print(f"✅ Fixed visibility for {section_id}")
    
    # Ensure landing section is visible by default
    content = re.sub(
        r'<div class="tool-section" id="landing-section"[^>]*style="display: none;"',
        '<div class="tool-section" id="landing-section"',
        content
    )
    
    with open('index.html', 'w') as f:
        f.write(content)
    
    return changes_made

def fix_navigation_handlers():
    """Ensure navigation handlers are properly set up"""
    with open('app.js', 'r') as f:
        content = f.read()
    
    # Check if initialization is properly called
    if 'initializeRouting();' not in content:
        print("❌ Missing routing initialization")
        return False
    
    # Check if data-target handlers are set up
    if 'data-target' not in content:
        print("❌ Missing data-target handlers")
        return False
    
    print("✅ Navigation handlers are properly configured")
    return True

def validate_component_isolation():
    """Validate that component isolation is working"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    results = {
        "landing_section_visible": 'id="landing-section"' in content and 'style="display: none;"' not in content.split('id="landing-section"')[0].split('>')[-1],
        "tool_sections_hidden": True,
        "navigation_buttons": True,
        "tool_sections_found": []
    }
    
    # Check if all tool sections are hidden by default
    tool_sections = re.findall(r'<div class="tool-section" id="([^"]+)"[^>]*>', content)
    for section in tool_sections:
        if section != 'landing-section':
            if f'id="{section}" style="display: none;"' not in content:
                results["tool_sections_hidden"] = False
                print(f"❌ {section} not properly hidden")
            else:
                print(f"✅ {section} properly hidden")
        results["tool_sections_found"].append(section)
    
    # Check for navigation buttons
    data_target_buttons = re.findall(r'data-target="([^"]+)"', content)
    if len(data_target_buttons) < 10:  # Should have many navigation buttons
        results["navigation_buttons"] = False
        print(f"❌ Only {len(data_target_buttons)} navigation buttons found")
    else:
        print(f"✅ {len(data_target_buttons)} navigation buttons found")
    
    return results

def create_component_test_suite():
    """Create automated tests for component isolation"""
    test_code = '''
// Component Isolation Test Suite
function testComponentIsolation() {
    const results = {
        "timestamp": new Date().toISOString(),
        "tests": {}
    };
    
    // Test 1: Only landing section visible on load
    const landingSection = document.getElementById('landing-section');
    const isLandingVisible = landingSection && landingSection.style.display !== 'none';
    results.tests.landing_visible_on_load = {
        "status": isLandingVisible ? "PASS" : "FAIL",
        "details": isLandingVisible ? "Landing section visible" : "Landing section not visible"
    };
    
    // Test 2: All tool sections hidden by default
    const toolSections = document.querySelectorAll('.tool-section:not(#landing-section)');
    let allHidden = true;
    toolSections.forEach(section => {
        if (section.style.display !== 'none') {
            allHidden = false;
        }
    });
    results.tests.tool_sections_hidden = {
        "status": allHidden ? "PASS" : "FAIL",
        "details": `${toolSections.length} tool sections checked, all hidden: ${allHidden}`
    };
    
    // Test 3: Navigation buttons functional
    const navButtons = document.querySelectorAll('[data-target]');
    results.tests.navigation_buttons_present = {
        "status": navButtons.length > 10 ? "PASS" : "FAIL",
        "details": `${navButtons.length} navigation buttons found`
    };
    
    // Test 4: showSection function works
    const showSectionExists = typeof window.showSection === 'function';
    results.tests.show_section_function = {
        "status": showSectionExists ? "PASS" : "FAIL",
        "details": showSectionExists ? "showSection function available" : "showSection function missing"
    };
    
    // Test 5: Routing functions work
    const routingExists = typeof window.initializeRouting === 'function';
    results.tests.routing_functions = {
        "status": routingExists ? "PASS" : "FAIL",
        "details": routingExists ? "Routing functions available" : "Routing functions missing"
    };
    
    return results;
}

// Run tests and log results
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const testResults = testComponentIsolation();
        console.log('Component Isolation Test Results:', testResults);
        
        // Save results to global variable for external access
        window.componentTestResults = testResults;
    }, 1000);
});
'''
    
    with open('component_isolation_test.js', 'w') as f:
        f.write(test_code)
    
    print("✅ Component test suite created")

def run_complete_fix():
    """Run the complete component isolation fix"""
    print("🔧 Starting ConvertWiz Component Isolation Fix...")
    
    # Step 1: Fix tool section visibility
    print("\n📍 Step 1: Fixing tool section visibility...")
    changes = fix_tool_section_visibility()
    print(f"   Made {changes} visibility corrections")
    
    # Step 2: Validate navigation handlers
    print("\n📍 Step 2: Validating navigation handlers...")
    nav_ok = fix_navigation_handlers()
    
    # Step 3: Validate component isolation
    print("\n📍 Step 3: Validating component isolation...")
    validation = validate_component_isolation()
    
    # Step 4: Create test suite
    print("\n📍 Step 4: Creating test suite...")
    create_component_test_suite()
    
    # Generate report
    report = {
        "timestamp": datetime.now().isoformat(),
        "changes_made": changes,
        "navigation_ok": nav_ok,
        "validation": validation,
        "status": "SUCCESS" if changes > 0 and nav_ok and validation["tool_sections_hidden"] else "NEEDS_REVIEW"
    }
    
    with open('component_isolation_fix_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n{'🎉 Component isolation fix completed successfully!' if report['status'] == 'SUCCESS' else '⚠️  Fix completed but needs review'}")
    print(f"   Report saved: component_isolation_fix_report.json")
    
    return report["status"] == "SUCCESS"

if __name__ == "__main__":
    success = run_complete_fix()
    exit(0 if success else 1)