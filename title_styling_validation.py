#!/usr/bin/env python3
"""
ConvertWiz Title Styling Validation Script
Validates that all pages use consistent "ConvertWiz ⚡" title with gradient styling.
"""

import re
import os
from pathlib import Path

def validate_title_styling():
    """Validate title styling consistency across all pages"""
    
    results = {
        'status': 'VALIDATION_STARTED',
        'pages_checked': 0,
        'pages_passed': 0,
        'pages_failed': 0,
        'validation_details': {},
        'errors': []
    }
    
    try:
        # Pages to check
        page_files = [
            'index.html',  # Main landing page
            'about.html',  # About page
            'faq.html',    # FAQ page
            'blog/index.html',  # Blog index
            'blog/jpg-to-png-complete-guide.html',  # Blog articles
            'blog/instagram-dp-resizer-guide.html',
            'blog/word-counter-writing-guide.html',
            'blog/dpi-checker-print-guide.html',
            'blog/global-land-units-conversion-guide.html'
        ]
        
        # Expected title elements
        expected_elements = [
            'ConvertWiz ⚡',  # Lightning bolt emoji
            'bg-gradient-to-r from-purple-600 to-pink-600',  # Gradient colors
            'bg-clip-text text-transparent',  # Text gradient effect
            'hover:scale-105 transition-transform',  # Hover effect
            'text-2xl md:text-3xl font-bold'  # Responsive sizing
        ]
        
        print("🔍 Starting ConvertWiz Title Styling Validation...")
        print("=" * 55)
        
        for file_path in page_files:
            results['pages_checked'] += 1
            print(f"\n📄 Checking: {file_path}")
            
            if not os.path.exists(file_path):
                error_msg = f"File not found: {file_path}"
                results['errors'].append(error_msg)
                results['validation_details'][file_path] = {'status': 'FILE_NOT_FOUND', 'missing_elements': []}
                print(f"   ❌ FILE NOT FOUND")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                missing_elements = []
                found_elements = []
                
                # Check each expected element
                for element in expected_elements:
                    if element in content:
                        found_elements.append(element)
                        print(f"   ✅ {element}")
                    else:
                        missing_elements.append(element)
                        print(f"   ❌ MISSING: {element}")
                
                # Special check for proper logo structure
                logo_patterns = [
                    r'<a[^>]*class="[^"]*text-2xl[^"]*md:text-3xl[^"]*font-bold[^"]*bg-gradient-to-r[^"]*from-purple-600[^"]*to-pink-600[^"]*bg-clip-text[^"]*text-transparent[^"]*"[^>]*>[\s\n]*ConvertWiz ⚡[\s\n]*</a>',
                    r'<h1[^>]*class="[^"]*text-2xl[^"]*md:text-3xl[^"]*font-bold[^"]*bg-gradient-to-r[^"]*from-purple-600[^"]*to-pink-600[^"]*bg-clip-text[^"]*text-transparent[^"]*"[^>]*>[\s\n]*ConvertWiz ⚡[\s\n]*</h1>'
                ]
                
                logo_found = any(re.search(pattern, content, re.DOTALL | re.IGNORECASE) for pattern in logo_patterns)
                
                if logo_found:
                    found_elements.append('Proper logo structure')
                    print(f"   ✅ Proper logo structure")
                else:
                    missing_elements.append('Proper logo structure')
                    print(f"   ❌ MISSING: Proper logo structure")
                
                # Determine pass/fail status
                if len(missing_elements) == 0:
                    results['pages_passed'] += 1
                    results['validation_details'][file_path] = {
                        'status': 'PASSED',
                        'found_elements': len(found_elements),
                        'missing_elements': []
                    }
                    print(f"   🎉 VALIDATION PASSED")
                else:
                    results['pages_failed'] += 1
                    results['validation_details'][file_path] = {
                        'status': 'FAILED',
                        'found_elements': len(found_elements),
                        'missing_elements': missing_elements
                    }
                    print(f"   💥 VALIDATION FAILED - {len(missing_elements)} missing elements")
                
            except Exception as e:
                error_msg = f"Error reading {file_path}: {str(e)}"
                results['errors'].append(error_msg)
                results['validation_details'][file_path] = {'status': 'ERROR', 'error': str(e)}
                print(f"   💥 ERROR: {str(e)}")
        
        # Calculate success rate
        if results['pages_checked'] > 0:
            success_rate = (results['pages_passed'] / results['pages_checked']) * 100
        else:
            success_rate = 0
        
        print("\n" + "=" * 55)
        print("📊 TITLE STYLING VALIDATION SUMMARY")
        print("=" * 55)
        print(f"Total Pages Checked: {results['pages_checked']}")
        print(f"Pages Passed: {results['pages_passed']}")
        print(f"Pages Failed: {results['pages_failed']}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if results['pages_failed'] == 0:
            print("🎉 ALL TITLE STYLING VALIDATIONS PASSED!")
            print("✨ ConvertWiz branding is now consistent across all pages!")
            results['status'] = 'ALL_PASSED'
        else:
            print("⚠️  Some title styling validations failed")
            results['status'] = 'SOME_FAILED'
        
        if results['errors']:
            print(f"\n❌ Errors encountered: {len(results['errors'])}")
            for error in results['errors']:
                print(f"   - {error}")
        
        return results
        
    except Exception as e:
        results['status'] = 'VALIDATION_ERROR'
        results['errors'].append(f"Validation script error: {str(e)}")
        print(f"💥 Validation script error: {str(e)}")
        return results

if __name__ == "__main__":
    validation_results = validate_title_styling()
    
    # Create validation report
    import json
    
    with open('title_styling_validation_report.json', 'w') as f:
        json.dump(validation_results, f, indent=2)
    
    print(f"\n📝 Detailed validation report saved to: title_styling_validation_report.json")
    
    # Exit with appropriate code
    if validation_results['status'] == 'ALL_PASSED':
        exit(0)
    else:
        exit(1)