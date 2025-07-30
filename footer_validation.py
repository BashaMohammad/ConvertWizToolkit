#!/usr/bin/env python3
"""
Footer Validation Script for Blog Articles
Validates that all blog articles have correct footer structure matching main ConvertWiz design.
"""

import re
import os
from pathlib import Path

def validate_footer_structure():
    """Validate footer structure across all blog articles"""
    
    results = {
        'status': 'VALIDATION_STARTED',
        'articles_checked': 0,
        'articles_passed': 0,
        'articles_failed': 0,
        'validation_details': {},
        'errors': []
    }
    
    try:
        # Blog articles to check
        blog_files = [
            'blog/jpg-to-png-complete-guide.html',
            'blog/instagram-dp-resizer-guide.html',
            'blog/word-counter-writing-guide.html',
            'blog/dpi-checker-print-guide.html',
            'blog/global-land-units-conversion-guide.html'
        ]
        
        # Expected footer elements (must all be present)
        required_footer_elements = [
            'bg-white/90 backdrop-blur-md py-8',  # Footer styling
            'Pricing Plans',  # Pricing link
            'Privacy Policy',  # Privacy link
            'Terms of Use',  # Terms link
            'Disclaimer',  # Disclaimer link
            'Credits',  # Credits link
            'Admin',  # Admin link
            '© 2025 ConvertWiz. All rights reserved.',  # Copyright
            'Powered by Ali',  # Attribution
            'mobile-menu-btn',  # Mobile menu script
        ]
        
        print("🔍 Starting Footer Structure Validation...")
        print("=" * 50)
        
        for file_path in blog_files:
            results['articles_checked'] += 1
            print(f"\n📄 Checking: {file_path}")
            
            if not os.path.exists(file_path):
                error_msg = f"File not found: {file_path}"
                results['errors'].append(error_msg)
                results['validation_details'][file_path] = {'status': 'FILE_NOT_FOUND', 'missing_elements': []}
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                missing_elements = []
                found_elements = []
                
                # Check each required element
                for element in required_footer_elements:
                    if element in content:
                        found_elements.append(element)
                        print(f"   ✅ {element}")
                    else:
                        missing_elements.append(element)
                        print(f"   ❌ MISSING: {element}")
                
                # Check for proper HTML structure
                if '</footer>' in content and '<footer' in content:
                    found_elements.append('Footer HTML structure')
                    print(f"   ✅ Footer HTML structure")
                else:
                    missing_elements.append('Footer HTML structure')
                    print(f"   ❌ MISSING: Footer HTML structure")
                
                # Check for mobile menu script
                if 'mobile-menu-btn' in content and 'DOMContentLoaded' in content:
                    found_elements.append('Mobile menu functionality')
                    print(f"   ✅ Mobile menu functionality")
                else:
                    missing_elements.append('Mobile menu functionality')
                    print(f"   ❌ MISSING: Mobile menu functionality")
                
                # Determine pass/fail status
                if len(missing_elements) == 0:
                    results['articles_passed'] += 1
                    results['validation_details'][file_path] = {
                        'status': 'PASSED',
                        'found_elements': len(found_elements),
                        'missing_elements': []
                    }
                    print(f"   🎉 VALIDATION PASSED")
                else:
                    results['articles_failed'] += 1
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
        if results['articles_checked'] > 0:
            success_rate = (results['articles_passed'] / results['articles_checked']) * 100
        else:
            success_rate = 0
        
        print("\n" + "=" * 50)
        print("📊 FOOTER VALIDATION SUMMARY")
        print("=" * 50)
        print(f"Total Articles Checked: {results['articles_checked']}")
        print(f"Articles Passed: {results['articles_passed']}")
        print(f"Articles Failed: {results['articles_failed']}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if results['articles_failed'] == 0:
            print("🎉 ALL FOOTER VALIDATIONS PASSED!")
            results['status'] = 'ALL_PASSED'
        else:
            print("⚠️  Some footer validations failed")
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
    validation_results = validate_footer_structure()
    
    # Create validation report
    import json
    
    with open('footer_validation_report.json', 'w') as f:
        json.dump(validation_results, f, indent=2)
    
    print(f"\n📝 Detailed validation report saved to: footer_validation_report.json")
    
    # Exit with appropriate code
    if validation_results['status'] == 'ALL_PASSED':
        exit(0)
    else:
        exit(1)