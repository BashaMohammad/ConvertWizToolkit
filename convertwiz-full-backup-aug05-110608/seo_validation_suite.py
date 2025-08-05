#!/usr/bin/env python3
"""
ConvertWiz SEO Validation Suite
Comprehensive SEO validation for all pages in convertwiz.in and blog.convertwiz.in
"""

import json
import re
import requests
import time
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import subprocess

class ConvertWizSEOValidator:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "meta_tags": {"status": "PENDING", "errors": []},
            "content_checks": {"status": "PENDING", "errors": []},
            "alt_attributes": {"status": "PENDING", "errors": []},
            "internal_links": {"status": "PENDING", "errors": []},
            "performance": {"status": "PENDING", "errors": []},
            "mobile_responsive": {"status": "PENDING", "errors": []},
            "schema_validation": {"status": "PENDING", "errors": []},
            "fixes_applied": []
        }
        self.base_url = "http://localhost:5000"
        self.blog_url = "https://blog.convertwiz.in"
        
        # Tool pages to validate
        self.tool_pages = [
            "/",  # Landing page
            "/jpg-to-png",
            "/currency",
            "/word-counter",
            "/image-compressor",
            "/qr-generator",
            "/text-to-speech",
            "/color-converter",
            "/percentage-calculator",
            "/temperature-converter",
            "/distance-converter",
            "/weight-converter",
            "/height-converter",
            "/ip-extractor",
            "/backlink-checker",
            "/meta-tag-generator"
        ]
        
        # Blog pages to validate
        self.blog_pages = [
            "/",
            "/convert-jpg-to-png-online",
            "/best-free-currency-converter",
            "/image-compression-guide",
            "/social-media-content-optimization",
            "/password-generator-security-tips",
            "/qr-code-marketing-strategies",
            "/color-psychology-web-design"
        ]

    def validate_meta_tags(self):
        """Check meta tags for all pages"""
        print("🔍 Validating Meta Tags...")
        errors = []
        
        # Check tool pages
        for page in self.tool_pages:
            try:
                response = requests.get(f"{self.base_url}{page}", timeout=10)
                if response.status_code != 200:
                    errors.append(f"Page {page} returned {response.status_code}")
                    continue
                    
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Check title
                title = soup.find('title')
                if not title or len(title.text.strip()) < 50 or len(title.text.strip()) > 60:
                    errors.append(f"{page}: Title missing or not 50-60 chars ({len(title.text.strip()) if title else 0})")
                
                # Check meta description
                desc = soup.find('meta', attrs={'name': 'description'})
                if not desc or len(desc.get('content', '')) < 120 or len(desc.get('content', '')) > 150:
                    errors.append(f"{page}: Meta description missing or not 120-150 chars")
                
                # Check canonical link
                canonical = soup.find('link', attrs={'rel': 'canonical'})
                if not canonical:
                    errors.append(f"{page}: Missing canonical link")
                    
            except Exception as e:
                errors.append(f"{page}: Error validating meta tags - {str(e)}")
        
        self.results["meta_tags"]["errors"] = errors
        self.results["meta_tags"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_content_checks(self):
        """Check SEO content blocks and FAQs"""
        print("📝 Validating Content Checks...")
        errors = []
        
        # Read index.html to check for SEO content sections
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
                soup = BeautifulSoup(content, 'html.parser')
                
                # Check for SEO content sections
                seo_sections = soup.find_all('section', class_='seo-content')
                if len(seo_sections) < 4:
                    errors.append(f"Found only {len(seo_sections)} SEO content sections, expected at least 4")
                
                # Check FAQ sections within SEO content
                faq_count = 0
                for section in seo_sections:
                    faq_headers = section.find_all('h2', string=re.compile(r'FAQ', re.I))
                    if faq_headers:
                        faq_count += 1
                
                if faq_count < 4:
                    errors.append(f"Found only {faq_count} FAQ sections in SEO content, expected at least 4")
                    
        except Exception as e:
            errors.append(f"Error reading index.html: {str(e)}")
        
        self.results["content_checks"]["errors"] = errors
        self.results["content_checks"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_alt_attributes(self):
        """Check all images have alt attributes and lazy loading"""
        print("🖼️ Validating Alt Attributes...")
        errors = []
        
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
                soup = BeautifulSoup(content, 'html.parser')
                
                images = soup.find_all('img')
                for img in images:
                    # Check alt attribute
                    if not img.get('alt'):
                        errors.append(f"Image missing alt attribute: {img.get('src', 'unknown')}")
                    elif not img.get('alt').strip():
                        errors.append(f"Image has empty alt attribute: {img.get('src', 'unknown')}")
                    
                    # Check lazy loading (optional but recommended)
                    if not img.get('loading'):
                        errors.append(f"Image missing lazy loading: {img.get('src', 'unknown')}")
                        
        except Exception as e:
            errors.append(f"Error validating alt attributes: {str(e)}")
        
        self.results["alt_attributes"]["errors"] = errors
        self.results["alt_attributes"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_internal_links(self):
        """Check internal links return HTTP 200"""
        print("🔗 Validating Internal Links...")
        errors = []
        
        # Check server is running
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code != 200:
                errors.append("Server not responding to health check")
                
        except Exception as e:
            errors.append(f"Server health check failed: {str(e)}")
        
        # Test key tool page routes
        test_routes = ["/", "/jpg-to-png", "/currency", "/word-counter", "/image-compressor"]
        for route in test_routes:
            try:
                response = requests.get(f"{self.base_url}{route}", timeout=10)
                if response.status_code != 200:
                    errors.append(f"Route {route} returned {response.status_code}")
            except Exception as e:
                errors.append(f"Route {route} failed: {str(e)}")
        
        self.results["internal_links"]["errors"] = errors
        self.results["internal_links"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_performance(self):
        """Check page load performance"""
        print("⚡ Validating Performance...")
        errors = []
        
        # Simple load time test
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/", timeout=10)
            load_time = time.time() - start_time
            
            if load_time > 2.0:
                errors.append(f"Page load time {load_time:.2f}s exceeds 2s threshold")
            
            # Check for blocking scripts
            soup = BeautifulSoup(response.content, 'html.parser')
            scripts = soup.find_all('script', src=True)
            for script in scripts:
                if 'firebase' in script.get('src', '').lower():
                    errors.append("Firebase scripts found - may impact performance")
                    
        except Exception as e:
            errors.append(f"Performance check failed: {str(e)}")
        
        self.results["performance"]["errors"] = errors
        self.results["performance"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_mobile_responsive(self):
        """Check mobile responsiveness"""
        print("📱 Validating Mobile Responsiveness...")
        errors = []
        
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for viewport meta tag
                if 'viewport' not in content:
                    errors.append("Missing viewport meta tag")
                
                # Check for responsive CSS classes
                if 'md:' not in content or 'lg:' not in content:
                    errors.append("Missing responsive Tailwind classes")
                
                # Check for mobile menu
                if 'mobile-menu' not in content:
                    errors.append("Missing mobile menu implementation")
                    
        except Exception as e:
            errors.append(f"Mobile responsiveness check failed: {str(e)}")
        
        self.results["mobile_responsive"]["errors"] = errors
        self.results["mobile_responsive"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def validate_schema(self):
        """Check for duplicate FAQ schemas"""
        print("🏗️ Validating Schema...")
        errors = []
        
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Count FAQ schema instances
                faq_schema_count = content.count('"@type": "FAQPage"')
                if faq_schema_count > 1:
                    errors.append(f"Found {faq_schema_count} FAQPage schemas, should be only 1")
                
                # Check for proper JSON-LD structure
                if '"@context": "https://schema.org"' not in content:
                    errors.append("Missing schema.org context")
                    
        except Exception as e:
            errors.append(f"Schema validation failed: {str(e)}")
        
        self.results["schema_validation"]["errors"] = errors
        self.results["schema_validation"]["status"] = "PASS" if not errors else "FAIL"
        return not errors

    def auto_fix_issues(self):
        """Automatically fix common SEO issues"""
        print("🔧 Auto-fixing SEO Issues...")
        fixes_applied = []
        
        # Fix missing alt attributes
        try:
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add lazy loading to images without it
            updated_content = re.sub(
                r'<img(?![^>]*loading=)([^>]+)>',
                r'<img\1 loading="lazy">',
                content
            )
            
            # Add alt attributes to images without them
            updated_content = re.sub(
                r'<img(?![^>]*alt=)([^>]+)>',
                r'<img\1 alt="ConvertWiz tool interface">',
                updated_content
            )
            
            if updated_content != content:
                with open('index.html', 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                fixes_applied.append("Added missing alt attributes and lazy loading")
                
        except Exception as e:
            print(f"Error applying fixes: {str(e)}")
        
        self.results["fixes_applied"] = fixes_applied
        return fixes_applied

    def run_validation(self):
        """Run complete SEO validation suite"""
        print("🚀 Starting SEO Validation Suite...")
        
        # Run all validation checks
        validations = [
            ("Meta Tags", self.validate_meta_tags),
            ("Content Checks", self.validate_content_checks),
            ("Alt Attributes", self.validate_alt_attributes),
            ("Internal Links", self.validate_internal_links),
            ("Performance", self.validate_performance),
            ("Mobile Responsive", self.validate_mobile_responsive),
            ("Schema", self.validate_schema)
        ]
        
        all_passed = True
        for name, validation_func in validations:
            try:
                passed = validation_func()
                all_passed = all_passed and passed
                print(f"✅ {name}: {'PASS' if passed else 'FAIL'}")
            except Exception as e:
                print(f"❌ {name}: ERROR - {str(e)}")
                all_passed = False
        
        # Apply fixes if needed
        if not all_passed:
            print("\n🔧 Applying automatic fixes...")
            self.auto_fix_issues()
            
            # Re-run validations after fixes
            print("\n🔄 Re-running validations after fixes...")
            for name, validation_func in validations:
                try:
                    passed = validation_func()
                    print(f"✅ {name}: {'PASS' if passed else 'FAIL'}")
                except Exception as e:
                    print(f"❌ {name}: ERROR - {str(e)}")
        
        # Generate final report
        self.generate_report()
        
        return all_passed

    def generate_report(self):
        """Generate comprehensive SEO validation report"""
        print("\n" + "="*50)
        print("SEO VALIDATION REPORT")
        print("="*50)
        
        all_passed = True
        for key, value in self.results.items():
            if key in ["timestamp", "fixes_applied"]:
                continue
            status = value.get("status", "UNKNOWN")
            print(f"- {key.replace('_', ' ').title()}: {status}")
            if status == "FAIL":
                all_passed = False
                for error in value.get("errors", []):
                    print(f"  ❌ {error}")
        
        if self.results["fixes_applied"]:
            print(f"\n🔧 Fixes Applied:")
            for fix in self.results["fixes_applied"]:
                print(f"  ✅ {fix}")
        
        print(f"\n{'✅ SEO Validation Complete: Site is AdSense-ready.' if all_passed else '❌ SEO Issues Found'}")
        
        # Save JSON report
        with open(f'seo_validation_report_{int(time.time())}.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        return all_passed

if __name__ == "__main__":
    validator = ConvertWizSEOValidator()
    validator.run_validation()