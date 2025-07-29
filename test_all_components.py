#!/usr/bin/env python3
"""
Test all components to verify they are working correctly
"""

import requests
import time
from datetime import datetime

def test_component_page(component_url, component_name):
    """Test if a component page loads and displays content"""
    try:
        response = requests.get(f"http://localhost:5000{component_url}", timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Check for component-specific content
            has_title = component_name.replace(' ', ' ') in content
            has_active_js = 'Force activating' in content or 'showSection' in content
            has_tool_content = 'converter-card' in content or 'tool-input' in content or 'upload-area' in content
            has_nav_header = 'ConvertWiz' in content and 'nav' in content.lower()
            is_activated = 'jpg-to-png-section.*active' in content if 'jpg-to-png' in component_url else True
            
            return {
                'url': component_url,
                'name': component_name,
                'status': 'PASS' if (has_title and has_active_js and has_nav_header) else 'FAIL',
                'has_title': has_title,
                'has_active_js': has_active_js,
                'has_tool_content': has_tool_content,
                'has_nav_header': has_nav_header,
                'content_length': len(content)
            }
        else:
            return {
                'url': component_url,
                'name': component_name,
                'status': 'FAIL',
                'error': f'HTTP {response.status_code}'
            }
    except Exception as e:
        return {
            'url': component_url,
            'name': component_name,
            'status': 'FAIL',
            'error': str(e)
        }

def test_all_components():
    """Test all 18+ components"""
    components = [
        ('/jpg-to-png', 'JPG to PNG Converter'),
        ('/currency-converter', 'Currency Converter'),
        ('/land-converter', 'Land Unit Converter'),
        ('/dp-resizer', 'Instagram DP Resizer'),
        ('/word-counter', 'Word Counter'),
        ('/distance-converter', 'Distance Converter'),
        ('/weight-converter', 'Weight Converter'),
        ('/height-converter', 'Height Converter'),
        ('/ip-extractor', 'IP Address Extractor'),
        ('/qr-generator', 'QR Code Generator'),
        ('/percentage-calculator', 'Percentage Calculator'),
        ('/temperature-converter', 'Temperature Converter'),
        ('/color-converter', 'Color Converter'),
        ('/image-compressor', 'Image Compressor'),
        ('/text-to-speech', 'Text to Speech'),
        ('/backlink-checker', 'Backlink Checker'),
        ('/meta-tag-generator', 'Meta Tag Generator'),
        ('/dpi-checker', 'DPI Checker'),
        ('/url-shortener', 'URL Shortener')
    ]
    
    print("🧪 Testing All ConvertWiz Components")
    print("=" * 60)
    
    results = []
    passed = 0
    failed = 0
    
    for url, name in components:
        print(f"Testing {name}...")
        result = test_component_page(url, name)
        results.append(result)
        
        if result['status'] == 'PASS':
            passed += 1
            print(f"   ✅ {name}: PASS")
        else:
            failed += 1
            print(f"   ❌ {name}: FAIL")
            if 'error' in result:
                print(f"      Error: {result['error']}")
            else:
                print(f"      Issues: Title={result.get('has_title', False)}, JS={result.get('has_active_js', False)}, Content={result.get('has_tool_content', False)}")
        
        time.sleep(0.1)  # Small delay between requests
    
    print("\n" + "=" * 60)
    print(f"📊 COMPONENT TEST RESULTS")
    print(f"   Total Components: {len(components)}")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Success Rate: {(passed/len(components)*100):.1f}%")
    
    # Test landing page
    print(f"\n🏠 Testing Landing Page...")
    landing_result = test_component_page('/', 'Landing Page')
    if landing_result['status'] == 'PASS':
        print(f"   ✅ Landing Page: PASS")
    else:
        print(f"   ❌ Landing Page: FAIL")
    
    print(f"\n🎯 Overall Status: {'ALL COMPONENTS WORKING' if failed == 0 else f'{failed} COMPONENTS NEED FIXING'}")
    
    return {
        'total': len(components),
        'passed': passed,
        'failed': failed,
        'results': results,
        'timestamp': datetime.now().isoformat()
    }

if __name__ == "__main__":
    test_all_components()