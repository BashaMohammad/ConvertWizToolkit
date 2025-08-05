#!/usr/bin/env python3
"""
ConvertWiz Footer Standardization Validation
Validates that About, FAQ, and Blog index pages have consistent footer structure matching main site
"""

import re
import json
from datetime import datetime

def check_footer_consistency(file_path):
    """Check if footer structure matches main site footer"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Required footer elements
        checks = {
            'footer_structure': 'bg-white/90 backdrop-blur-md py-8' in content,
            'pricing_plans_link': 'Pricing Plans' in content and 'subscribe.html' in content,
            'privacy_policy_link': 'Privacy Policy' in content and 'privacy.html' in content,
            'terms_link': 'Terms of Use' in content and 'terms.html' in content,
            'disclaimer_link': 'Disclaimer' in content and 'disclaimer.html' in content,
            'credits_link': 'Credits' in content and 'credits.html' in content,
            'admin_link': 'Admin' in content and 'admin.html' in content,
            'copyright': '© 2025 ConvertWiz. All rights reserved.' in content,
            'powered_by': 'Powered by Ali' in content,
            'legal_links_section': '<!-- Legal Links -->' in content
        }
        
        return checks
        
    except FileNotFoundError:
        return {'error': f'File not found: {file_path}'}
    except Exception as e:
        return {'error': f'Error reading {file_path}: {str(e)}'}

def main():
    print("🔍 Starting ConvertWiz Footer Standardization Validation...")
    print("=" * 70)
    
    # Files to validate
    files_to_check = [
        'about.html',
        'faq.html',
        'blog/index.html'
    ]
    
    validation_results = {}
    total_files = len(files_to_check)
    passed_files = 0
    
    for file_path in files_to_check:
        print(f"\n📄 Checking: {file_path}")
        
        checks = check_footer_consistency(file_path)
        
        if 'error' in checks:
            print(f"   ❌ ERROR: {checks['error']}")
            validation_results[file_path] = {'status': 'error', 'checks': checks}
            continue
        
        # Check if all elements passed
        all_passed = all(checks.values())
        
        # Display individual check results
        for check_name, result in checks.items():
            status = "✅" if result else "❌"
            check_label = check_name.replace('_', ' ').title()
            print(f"   {status} {check_label}")
        
        if all_passed:
            print(f"   🎉 VALIDATION PASSED")
            passed_files += 1
            validation_results[file_path] = {'status': 'passed', 'checks': checks}
        else:
            print(f"   ❌ VALIDATION FAILED")
            validation_results[file_path] = {'status': 'failed', 'checks': checks}
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 FOOTER STANDARDIZATION VALIDATION SUMMARY")
    print("=" * 70)
    print(f"Total Pages Checked: {total_files}")
    print(f"Pages Passed: {passed_files}")
    print(f"Pages Failed: {total_files - passed_files}")
    print(f"Success Rate: {(passed_files/total_files)*100:.1f}%")
    
    if passed_files == total_files:
        print("🎉 ALL FOOTER STANDARDIZATIONS PASSED!")
        print("✨ About, FAQ, and Blog index pages now match main site footer!")
    else:
        print("⚠️  Some pages need footer updates")
        
    # Save detailed report
    report = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_files': total_files,
            'passed_files': passed_files,
            'failed_files': total_files - passed_files,
            'success_rate': (passed_files/total_files)*100
        },
        'detailed_results': validation_results
    }
    
    with open('footer_validation_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📝 Detailed validation report saved to: footer_validation_report.json")

if __name__ == "__main__":
    main()