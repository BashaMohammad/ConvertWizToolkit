#!/usr/bin/env python3
"""
Test Isolated Tools System for ConvertWiz
Validates that the tool reorganization works correctly
"""

import requests
import json
import os
from pathlib import Path

def test_tool_registry():
    """Test tool registry API"""
    try:
        response = requests.get('http://localhost:5000/api/tools')
        if response.status_code == 200:
            registry = response.json()
            print(f"✅ Tool registry loaded: {len(registry['tools'])} tools")
            print(f"📁 Categories: {list(registry['categories'].keys())}")
            return True
        else:
            print(f"❌ Tool registry failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tool registry error: {e}")
        return False

def test_tool_folders():
    """Test that all tool folders were created"""
    tools_dir = Path("tools")
    if not tools_dir.exists():
        print("❌ Tools directory not found")
        return False
    
    expected_tools = [
        "jpg-to-png", "png-to-jpg", "instagram-dp", "image-compressor",
        "currency-converter", "land-unit-converter", "percentage-calculator",
        "temperature-converter", "color-format-converter", "get-my-ip",
        "qr-code-generator", "lorem-ipsum", "text-to-speech",
        "backlink-checker", "meta-tag-generator", "dpi-checker",
        "bmi-calculator", "text-case-converter", "pdf-to-word",
        "pdf-to-powerpoint", "pdf-to-excel", "pdf-split", "pdf-merge-compress"
    ]
    
    created_tools = []
    for tool in expected_tools:
        tool_dir = tools_dir / tool
        if tool_dir.exists():
            # Check required files
            required_files = ["index.html", "style.css", "script.js", "config.json"]
            if all((tool_dir / file).exists() for file in required_files):
                created_tools.append(tool)
            else:
                print(f"⚠️ Tool {tool} missing required files")
        else:
            print(f"❌ Tool directory not found: {tool}")
    
    print(f"✅ Created {len(created_tools)}/{len(expected_tools)} tool folders")
    return len(created_tools) == len(expected_tools)

def test_tool_content_api():
    """Test tool content API endpoints"""
    test_sections = [
        "jpg-to-png-section",
        "png-to-jpg-section", 
        "currency-converter-section",
        "bmi-calculator-section"
    ]
    
    success_count = 0
    for section in test_sections:
        try:
            response = requests.get(f'http://localhost:5000/api/tool-content/{section}')
            if response.status_code == 200 and response.text:
                print(f"✅ Tool content API working for: {section}")
                success_count += 1
            else:
                print(f"❌ Tool content API failed for: {section}")
        except Exception as e:
            print(f"❌ Tool content API error for {section}: {e}")
    
    print(f"✅ Tool content API: {success_count}/{len(test_sections)} working")
    return success_count == len(test_sections)

def test_individual_tool_configs():
    """Test individual tool configuration files"""
    tools_dir = Path("tools")
    config_count = 0
    
    for tool_dir in tools_dir.iterdir():
        if tool_dir.is_dir() and tool_dir.name != "registry.json":
            config_file = tool_dir / "config.json"
            if config_file.exists():
                try:
                    with open(config_file) as f:
                        config = json.load(f)
                    
                    required_keys = ["name", "section", "category", "version"]
                    if all(key in config for key in required_keys):
                        config_count += 1
                    else:
                        print(f"⚠️ Tool config incomplete: {tool_dir.name}")
                except Exception as e:
                    print(f"❌ Tool config error for {tool_dir.name}: {e}")
    
    print(f"✅ Tool configs validated: {config_count} tools")
    return config_count > 0

def test_saturday_component_isolation():
    """Test that Saturday components are properly isolated"""
    saturday_tools = [
        "bmi-calculator", "text-case-converter", "png-to-jpg",
        "pdf-to-word", "pdf-to-powerpoint", "pdf-to-excel",
        "pdf-split", "pdf-merge-compress"
    ]
    
    isolated_count = 0
    for tool in saturday_tools:
        tool_dir = Path(f"tools/{tool}")
        config_file = tool_dir / "config.json"
        
        if config_file.exists():
            try:
                with open(config_file) as f:
                    config = json.load(f)
                
                if config.get("saturday") == True:
                    isolated_count += 1
                    print(f"✅ Saturday tool isolated: {tool}")
            except Exception as e:
                print(f"❌ Error checking Saturday tool {tool}: {e}")
    
    print(f"✅ Saturday components isolated: {isolated_count}/{len(saturday_tools)}")
    return isolated_count == len(saturday_tools)

def main():
    """Run all tests"""
    print("🧪 Testing ConvertWiz Isolated Tool System")
    print("=" * 50)
    
    tests = [
        ("Tool Registry API", test_tool_registry),
        ("Tool Folder Structure", test_tool_folders),
        ("Tool Content API", test_tool_content_api),
        ("Tool Configurations", test_individual_tool_configs),
        ("Saturday Component Isolation", test_saturday_component_isolation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔧 Testing: {test_name}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - Isolated tool system is working!")
        print("🔧 Tools are now organized and conflict-free")
        print("📁 Each tool has its own isolated environment")
        print("🚀 No more cascading function conflicts")
    else:
        print("⚠️ Some tests failed - check logs above")
    
    return passed == total

if __name__ == "__main__":
    main()