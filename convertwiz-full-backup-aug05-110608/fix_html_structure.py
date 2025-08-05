#!/usr/bin/env python3
"""
Fix HTML structure for all tool sections
"""

import re

def fix_html_structure():
    """Fix broken HTML structure in tool sections"""
    with open('index.html', 'r') as f:
        content = f.read()
    
    print("🔧 Fixing HTML structure for tool sections...")
    
    # Pattern to find broken tool section structure
    # Look for: <div class="tool-section" id="..." style="display: none;">
    #           <!-- comment -->
    #           </div>
    #           
    #           <main>
    
    broken_pattern = r'(<div class="tool-section" id="[^"]+"\s+style="display: none;">)\s*(<!-- [^>]+ -->)\s*(</div>)\s*(<main[^>]*>)'
    
    # Fix: Remove the premature closing </div>
    fixed_replacement = r'\1\n        \2\n        \n        \4'
    
    matches = re.findall(broken_pattern, content)
    print(f"Found {len(matches)} broken tool section structures")
    
    if matches:
        content = re.sub(broken_pattern, fixed_replacement, content)
        print("✅ Fixed broken tool section structures")
    
    # Now we need to properly close each tool section at the end
    # Find where each tool section should end (before the next tool section or before footer)
    
    # Add proper closing tags before each new tool section
    tool_section_pattern = r'(</main>\s*)(</div>\s*)?(\s*<!-- [A-Z\s]+ SECTION -->)'
    content = re.sub(tool_section_pattern, r'\1</div>\2\3', content)
    
    # Make sure the last tool section is properly closed before footer
    footer_pattern = r'(</main>\s*)(\s*<footer)'
    content = re.sub(footer_pattern, r'\1</div>\2', content)
    
    with open('index.html', 'w') as f:
        f.write(content)
    
    print("✅ HTML structure fixed")
    return True

if __name__ == "__main__":
    fix_html_structure()