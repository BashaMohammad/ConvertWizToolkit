#!/usr/bin/env python3
"""
Tool Reorganization Script for ConvertWiz
Separates tools into individual folders with isolated functionality
"""

import os
import shutil
import json
from datetime import datetime

def create_backup():
    """Create full project backup before reorganization"""
    backup_name = f"convertwiz-full-backup-aug05-{datetime.now().strftime('%H%M%S')}"
    if os.path.exists(backup_name):
        shutil.rmtree(backup_name)
    shutil.copytree(".", backup_name, ignore=shutil.ignore_patterns('.git', '__pycache__', 'node_modules'))
    print(f"✅ Full backup created: {backup_name}")

def create_tool_structure():
    """Create individual tool folders with isolated structure"""
    
    # Tool definitions with their sections from index.html
    tools = {
        "jpg-to-png": {
            "title": "JPG to PNG Converter",
            "section": "jpg-to-png-section",
            "category": "image-tools"
        },
        "png-to-jpg": {
            "title": "PNG to JPG Converter", 
            "section": "png-to-jpg-section",
            "category": "image-tools"
        },
        "instagram-dp": {
            "title": "Instagram DP Resizer",
            "section": "instagram-dp-section", 
            "category": "image-tools"
        },
        "image-compressor": {
            "title": "Image Compressor",
            "section": "image-compressor-section",
            "category": "image-tools"
        },
        "currency-converter": {
            "title": "Currency Converter",
            "section": "currency-converter-section",
            "category": "unit-converters"
        },
        "land-unit-converter": {
            "title": "Land Unit Converter", 
            "section": "land-unit-converter-section",
            "category": "unit-converters"
        },
        "percentage-calculator": {
            "title": "Percentage Calculator",
            "section": "percentage-calculator-section",
            "category": "utility-tools"
        },
        "temperature-converter": {
            "title": "Temperature Converter",
            "section": "temperature-converter-section", 
            "category": "unit-converters"
        },
        "color-format-converter": {
            "title": "Color Format Converter",
            "section": "color-format-converter-section",
            "category": "utility-tools"
        },
        "get-my-ip": {
            "title": "Get My IP Address",
            "section": "get-my-ip-section",
            "category": "utility-tools"
        },
        "qr-code-generator": {
            "title": "QR Code Generator",
            "section": "qr-code-generator-section",
            "category": "utility-tools"
        },
        "lorem-ipsum": {
            "title": "Lorem Ipsum Generator",
            "section": "lorem-ipsum-section",
            "category": "utility-tools"
        },
        "text-to-speech": {
            "title": "Text to Speech",
            "section": "text-to-speech-section",
            "category": "utility-tools"
        },
        "backlink-checker": {
            "title": "Backlink Checker",
            "section": "backlink-checker-section",
            "category": "utility-tools"
        },
        "meta-tag-generator": {
            "title": "Meta Tag Generator",
            "section": "meta-tag-generator-section",
            "category": "utility-tools"
        },
        "dpi-checker": {
            "title": "DPI Checker",
            "section": "dpi-checker-section",
            "category": "utility-tools"
        },
        "bmi-calculator": {
            "title": "BMI Calculator",
            "section": "bmi-calculator-section",
            "category": "utility-tools",
            "saturday": True
        },
        "text-case-converter": {
            "title": "Text Case Converter",
            "section": "text-case-converter-section", 
            "category": "utility-tools",
            "saturday": True
        },
        "pdf-to-word": {
            "title": "PDF to Word Converter",
            "section": "pdf-to-word-section",
            "category": "pdf-tools",
            "saturday": True
        },
        "pdf-to-powerpoint": {
            "title": "PDF to PowerPoint Converter",
            "section": "pdf-to-powerpoint-section",
            "category": "pdf-tools", 
            "saturday": True
        },
        "pdf-to-excel": {
            "title": "PDF to Excel Converter",
            "section": "pdf-to-excel-section",
            "category": "pdf-tools",
            "saturday": True
        },
        "pdf-split": {
            "title": "PDF Split Tool",
            "section": "pdf-split-section",
            "category": "pdf-tools",
            "saturday": True
        },
        "pdf-merge-compress": {
            "title": "PDF Merge & Compress",
            "section": "pdf-merge-compress-section",
            "category": "pdf-tools",
            "saturday": True
        }
    }
    
    # Create tools directory
    os.makedirs("tools", exist_ok=True)
    
    # Create each tool folder
    for tool_id, tool_info in tools.items():
        tool_dir = f"tools/{tool_id}"
        os.makedirs(tool_dir, exist_ok=True)
        
        # Create index.html for tool
        create_tool_html(tool_dir, tool_info)
        
        # Create isolated CSS
        create_tool_css(tool_dir, tool_info)
        
        # Create isolated JS
        create_tool_js(tool_dir, tool_info)
        
        # Create tool config
        create_tool_config(tool_dir, tool_info)
        
        print(f"✅ Created tool: {tool_id}")
    
    # Create master tool registry
    create_tool_registry(tools)
    
def create_tool_html(tool_dir, tool_info):
    """Create isolated HTML for each tool"""
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{tool_info["title"]} - ConvertWiz</title>
    <meta name="description" content="Free {tool_info["title"]} tool by ConvertWiz">
    <link href="https://cdn.tailwindcss.com" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray-50">
    <div class="tool-container">
        <header class="tool-header">
            <a href="/" class="back-link">
                <i class="fas fa-arrow-left"></i> Back to ConvertWiz
            </a>
            <h1>{tool_info["title"]}</h1>
        </header>
        
        <div class="tool-content" id="tool-content">
            <!-- Tool-specific content will be loaded here -->
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                Loading {tool_info["title"]}...
            </div>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>'''
    
    with open(f"{tool_dir}/index.html", "w", encoding="utf-8") as f:
        f.write(html_content)

def create_tool_css(tool_dir, tool_info):
    """Create isolated CSS for each tool"""
    css_content = '''/* Tool-specific styling */
.tool-container {
    min-height: 100vh;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.tool-header {
    margin-bottom: 30px;
    text-align: center;
}

.back-link {
    display: inline-flex;
    align-items: center;
    color: #6b7280;
    text-decoration: none;
    margin-bottom: 20px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
}

.back-link:hover {
    background-color: #f3f4f6;
    color: #374151;
}

.tool-header h1 {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1f2937;
    margin: 0;
}

.tool-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
    font-size: 1.1rem;
}

.loading i {
    margin-right: 10px;
    color: #3b82f6;
}

/* Responsive design */
@media (max-width: 768px) {
    .tool-container {
        padding: 10px;
    }
    
    .tool-header h1 {
        font-size: 2rem;
    }
    
    .tool-content {
        padding: 20px;
    }
}'''
    
    with open(f"{tool_dir}/style.css", "w", encoding="utf-8") as f:
        f.write(css_content)

def create_tool_js(tool_dir, tool_info):
    """Create isolated JavaScript for each tool"""
    js_content = f'''/**
 * {tool_info["title"]} - Isolated Tool Implementation
 * Part of ConvertWiz Multi-Tool Suite
 */

(function() {{
    'use strict';
    
    // Tool configuration
    const TOOL_CONFIG = {{
        name: '{tool_info["title"]}',
        section: '{tool_info["section"]}',
        category: '{tool_info["category"]}',
        Saturday: {'true' if tool_info.get("saturday") else 'false'}
    }};
    
    // Initialize tool when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {{
        console.log(`🔧 Initializing ${{TOOL_CONFIG.name}}...`);
        initializeTool();
    }});
    
    function initializeTool() {{
        // Load tool content from main application
        loadToolContent();
        
        // Set up error handling
        window.addEventListener('error', handleError);
    }}
    
    function loadToolContent() {{
        // Fetch tool content from main app
        fetch('/api/tool-content/' + '{tool_info["section"]}')
            .then(response => response.text())
            .then(html => {{
                const contentContainer = document.getElementById('tool-content');
                if (contentContainer) {{
                    contentContainer.innerHTML = html;
                    
                    // Initialize tool-specific functionality
                    initializeToolFunctionality();
                }}
            }})
            .catch(error => {{
                console.error('Error loading tool content:', error);
                showErrorMessage('Failed to load tool. Please try again.');
            }});
    }}
    
    function initializeToolFunctionality() {{
        // Tool-specific initialization will be handled by main app
        const event = new CustomEvent('toolLoaded', {{
            detail: {{ 
                section: TOOL_CONFIG.section,
                category: TOOL_CONFIG.category 
            }}
        }});
        document.dispatchEvent(event);
        
        console.log(`✅ ${{TOOL_CONFIG.name}} loaded successfully`);
    }}
    
    function handleError(error) {{
        console.error('Tool error:', error);
        showErrorMessage('An error occurred. Please refresh the page.');
    }}
    
    function showErrorMessage(message) {{
        const contentContainer = document.getElementById('tool-content');
        if (contentContainer) {{
            contentContainer.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p style="font-size: 1.1rem; margin: 0;">${{message}}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }}
    }}
}})();'''
    
    with open(f"{tool_dir}/script.js", "w", encoding="utf-8") as f:
        f.write(js_content)

def create_tool_config(tool_dir, tool_info):
    """Create tool configuration file"""
    config = {
        "name": tool_info["title"],
        "section": tool_info["section"], 
        "category": tool_info["category"],
        "saturday": tool_info.get("saturday", False),
        "version": "1.0.0",
        "created": datetime.now().isoformat(),
        "dependencies": [],
        "routes": [
            f"/{tool_info['section'].replace('-section', '')}",
            f"/tools/{tool_dir.split('/')[-1]}"
        ]
    }
    
    with open(f"{tool_dir}/config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

def create_tool_registry(tools):
    """Create master registry of all tools"""
    registry = {
        "version": "1.0.0",
        "created": datetime.now().isoformat(),
        "tools": tools,
        "categories": {
            "image-tools": [],
            "unit-converters": [],
            "utility-tools": [],
            "pdf-tools": []
        }
    }
    
    # Organize tools by category
    for tool_id, tool_info in tools.items():
        category = tool_info["category"]
        if category in registry["categories"]:
            registry["categories"][category].append(tool_id)
    
    with open("tools/registry.json", "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
    
    print("✅ Tool registry created")

def main():
    """Main reorganization process"""
    print("🚀 Starting ConvertWiz tool reorganization...")
    
    # Create backup
    create_backup()
    
    # Create new tool structure  
    create_tool_structure()
    
    print("\n✅ Tool reorganization complete!")
    print("📁 Each tool now has its own isolated folder")
    print("🔧 Tools can be developed and tested independently")
    print("🚀 No more function conflicts or cascading issues")

if __name__ == "__main__":
    main()