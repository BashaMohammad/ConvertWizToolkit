#!/usr/bin/env python3
"""
EMERGENCY COMPONENT ISOLATION FIX
This script will completely restructure the HTML to ensure proper component isolation
"""

import re
import shutil
from datetime import datetime

def create_emergency_backup():
    """Create emergency backup"""
    backup_name = f"emergency_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy('index.html', f'{backup_name}_index.html')
    print(f"✅ Emergency backup created: {backup_name}_index.html")
    return backup_name

def analyze_current_structure():
    """Analyze current HTML structure"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    # Find all tool sections
    tool_sections = re.findall(r'<div class="tool-section" id="([^"]+)"[^>]*>', content)
    print(f"📊 Found {len(tool_sections)} tool sections:")
    for section in tool_sections:
        print(f"   - {section}")
    
    # Check for actual tool interfaces (upload areas, input fields)
    upload_areas = len(re.findall(r'upload-area|converter-card|tool-input', content))
    print(f"📊 Found {upload_areas} tool interface elements")
    
    return tool_sections, upload_areas

def fix_component_isolation():
    """Fix component isolation by ensuring proper section boundaries"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    # Ensure all tool sections have proper display:none except landing
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
    
    # Fix each tool section to ensure it has proper display:none
    for section_id in tool_sections:
        # Pattern to match the section opening tag
        pattern = f'<div class="tool-section" id="{section_id}"(?![^>]*style="display: none;")[^>]*>'
        replacement = f'<div class="tool-section" id="{section_id}" style="display: none;">'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes_made += 1
            print(f"✅ Fixed {section_id}")
    
    # Ensure landing section is visible
    landing_pattern = r'<div class="tool-section" id="landing-section"[^>]*style="display: none;"[^>]*>'
    if re.search(landing_pattern, content):
        content = re.sub(landing_pattern, '<div class="tool-section" id="landing-section" style="display: block;">', content)
        changes_made += 1
        print("✅ Made landing section visible")
    
    # Add critical CSS to force component isolation
    css_injection = '''
<style>
/* EMERGENCY COMPONENT ISOLATION */
.tool-section:not(#landing-section) {
    display: none !important;
    visibility: hidden !important;
}

.tool-section.active {
    display: block !important;
    visibility: visible !important;
}

#landing-section {
    display: block !important;
    visibility: visible !important;
}
</style>
'''
    
    # Inject CSS before closing head tag
    if '</head>' in content:
        content = content.replace('</head>', css_injection + '</head>')
        changes_made += 1
        print("✅ Injected emergency CSS")
    
    with open('index.html', 'w') as f:
        f.write(content)
    
    return changes_made

def validate_fix():
    """Validate the fix worked"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    # Check if landing section is visible
    landing_visible = 'id="landing-section" style="display: block;"' in content
    
    # Check if tool sections are hidden
    tool_sections_hidden = content.count('tool-section" id=') > content.count('style="display: block;"')
    
    # Check for emergency CSS
    emergency_css = 'EMERGENCY COMPONENT ISOLATION' in content
    
    print(f"\n📋 Validation Results:")
    print(f"   Landing visible: {'✅' if landing_visible else '❌'}")
    print(f"   Tool sections hidden: {'✅' if tool_sections_hidden else '❌'}")
    print(f"   Emergency CSS injected: {'✅' if emergency_css else '❌'}")
    
    return landing_visible and tool_sections_hidden and emergency_css

def run_emergency_fix():
    """Run complete emergency fix"""
    print("🚨 EMERGENCY COMPONENT ISOLATION FIX")
    print("=" * 50)
    
    # Step 1: Create backup
    backup_name = create_emergency_backup()
    
    # Step 2: Analyze current structure
    print("\n📊 Analyzing current structure...")
    tool_sections, upload_areas = analyze_current_structure()
    
    # Step 3: Apply fixes
    print("\n🔧 Applying emergency fixes...")
    changes = fix_component_isolation()
    print(f"   Made {changes} changes")
    
    # Step 4: Validate
    print("\n✅ Validating fixes...")
    success = validate_fix()
    
    print(f"\n{'🎉 EMERGENCY FIX COMPLETED SUCCESSFULLY!' if success else '❌ EMERGENCY FIX FAILED'}")
    print(f"Backup available: {backup_name}_index.html")
    
    return success

if __name__ == "__main__":
    success = run_emergency_fix()
    exit(0 if success else 1)