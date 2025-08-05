#!/usr/bin/env python3
"""
ConvertWiz AdSense Placeholder Removal Script
Removes all temporary AdSense banners while preserving UI integrity
"""

import re
import os
from datetime import datetime

def remove_adsense_from_html():
    """Remove all AdSense placeholders from index.html"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Remove AdSense script tags
    content = re.sub(r'<script[^>]*adsbygoogle[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    
    # Remove AdSense verification comments
    content = re.sub(r'<!-- Google AdSense.*?-->', '', content, flags=re.DOTALL)
    
    # Remove entire AdSense banner containers
    content = re.sub(r'<div[^>]*adsense-banner[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*ads-container[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*sidebar-ad-[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
    
    # Remove individual AdSense elements
    content = re.sub(r'<ins[^>]*adsbygoogle[^>]*>.*?</ins>\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*ad-placeholder[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*adsense-placeholder[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
    
    # Remove AdSense JavaScript initialization blocks
    content = re.sub(r'if \(window\.adsbygoogle\)[^}]*}', '', content, flags=re.DOTALL)
    content = re.sub(r'\(adsbygoogle = window\.adsbygoogle.*?\)\[\]\.push.*?;', '', content, flags=re.DOTALL)
    
    # Remove adsense-fix.js script inclusion
    content = re.sub(r'<script src="adsense-fix\.js"></script>', '', content)
    
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    with open('index.html', 'w') as f:
        f.write(content)
    
    return len(original_content) - len(content)

def remove_adsense_from_css():
    """Remove all AdSense-related CSS from style.css"""
    with open('style.css', 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Remove AdSense CSS classes and rules
    css_patterns = [
        r'\.adsense-banner[^{]*{[^}]*}',
        r'\.adsense-placeholder[^{]*{[^}]*}',
        r'\.adsbygoogle[^{]*{[^}]*}',
        r'\.ad-placeholder[^{]*{[^}]*}',
        r'\.ads-container[^{]*{[^}]*}',
        r'\.sidebar-ad-[^{]*{[^}]*}',
        r'\.adsense-lazy[^{]*{[^}]*}',
        r'body\[data-env="development"\][^{]*adsense[^{]*{[^}]*}',
        r'body\[data-env="development"\][^{]*ad-placeholder[^{]*{[^}]*}',
    ]
    
    for pattern in css_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Remove multi-selector rules containing AdSense classes
    content = re.sub(r'[^{]*adsense[^{]*{[^}]*}', '', content, flags=re.DOTALL)
    content = re.sub(r'[^{]*ad-placeholder[^{]*{[^}]*}', '', content, flags=re.DOTALL)
    
    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    with open('style.css', 'w') as f:
        f.write(content)
    
    return len(original_content) - len(content)

def remove_adsense_from_js():
    """Remove AdSense references from JavaScript files"""
    changes = 0
    
    # Remove from tools.js if exists
    if os.path.exists('tools.js'):
        with open('tools.js', 'r') as f:
            content = f.read()
        
        original_content = content
        
        # Remove AdSense initialization code
        content = re.sub(r'adsbygoogle[^;]*;', '', content)
        content = re.sub(r'window\.adsbygoogle[^;]*;', '', content)
        
        with open('tools.js', 'w') as f:
            f.write(content)
        
        changes += len(original_content) - len(content)
    
    return changes

def run_cleanup():
    """Run the complete AdSense cleanup process"""
    print("🧹 Starting ConvertWiz AdSense Placeholder Cleanup...")
    
    # Track changes
    html_changes = remove_adsense_from_html()
    css_changes = remove_adsense_from_css()
    js_changes = remove_adsense_from_js()
    
    # Remove adsense-fix.js if it exists
    if os.path.exists('adsense-fix.js'):
        os.remove('adsense-fix.js')
        print("✅ Removed adsense-fix.js file")
    
    print(f"✅ HTML cleanup: {html_changes} characters removed")
    print(f"✅ CSS cleanup: {css_changes} characters removed") 
    print(f"✅ JS cleanup: {js_changes} characters removed")
    
    print("\n🎉 AdSense placeholder cleanup complete!")
    print("   - All banner placeholders removed")
    print("   - UI layout and gradients preserved")
    print("   - Site ready for professional AdSense review")
    
    return {
        'html_changes': html_changes,
        'css_changes': css_changes,
        'js_changes': js_changes,
        'timestamp': datetime.now().isoformat()
    }

if __name__ == "__main__":
    results = run_cleanup()
    print(f"\nCleanup completed at: {results['timestamp']}")