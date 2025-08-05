#!/usr/bin/env python3
"""
ConvertWiz Navigation & SEO Validation Script
Validates navigation consistency, SEO optimization, and AdSense compliance across all pages
"""

import os
import re
import json
from datetime import datetime

class ConvertWizValidator:
    def __init__(self):
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "navigation_consistency": {},
            "seo_optimization": {},
            "responsiveness": {},
            "adsense_compliance": {},
            "overall_score": 0,
            "issues": [],
            "recommendations": []
        }
        
        # Expected navigation links for consistency
        self.expected_nav_links = [
            ('index.html', 'Home'),
            ('blog/index.html', 'Blog'),
            ('about.html', 'About'),
            ('faq.html', 'FAQ'),
            ('privacy.html', 'Privacy'),
            ('terms.html', 'Terms'),
            ('mailto:support@convertwiz.in', 'Contact')
        ]
        
        # Core pages to validate
        self.core_pages = [
            'index.html',
            'about.html',
            'faq.html',
            'privacy.html',
            'terms.html',
            'disclaimer.html'
        ]

    def validate_navigation_consistency(self):
        """Validate navigation consistency across all pages"""
        print("🔍 Validating Navigation Consistency...")
        
        nav_results = {}
        
        for page in self.core_pages:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check navigation structure
            nav_section = re.search(r'<nav[^>]*>.*?</nav>', content, re.DOTALL)
            if not nav_section:
                nav_results[page] = {"status": "FAIL", "issue": "No navigation section found"}
                continue
            
            nav_html = nav_section.group(0)
            
            # Check for expected navigation links
            missing_links = []
            for link_href, link_text in self.expected_nav_links:
                if link_href not in nav_html:
                    missing_links.append(f"{link_text} ({link_href})")
            
            # Check for consistent navigation classes
            has_consistent_classes = all(x in nav_html for x in [
                'bg-white/10',
                'backdrop-blur-md',
                'border-b border-white/20',
                'sticky top-0 z-40'
            ])
            
            nav_results[page] = {
                "status": "PASS" if not missing_links and has_consistent_classes else "FAIL",
                "missing_links": missing_links,
                "consistent_styling": has_consistent_classes,
                "has_logo": "ConvertWiz" in nav_html,
                "responsive_menu": "md:flex" in nav_html
            }
        
        self.report["navigation_consistency"] = nav_results
        return nav_results

    def validate_seo_optimization(self):
        """Validate SEO elements across all pages"""
        print("🔍 Validating SEO Optimization...")
        
        seo_results = {}
        
        for page in self.core_pages:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract head section
            head_match = re.search(r'<head[^>]*>(.*?)</head>', content, re.DOTALL)
            head_content = head_match.group(1) if head_match else ""
            
            # Check essential SEO elements
            seo_checks = {
                "title": bool(re.search(r'<title[^>]*>([^<]+)</title>', head_content)),
                "meta_description": bool(re.search(r'<meta[^>]*name=["\']description["\'][^>]*>', head_content)),
                "meta_keywords": bool(re.search(r'<meta[^>]*name=["\']keywords["\'][^>]*>', head_content)),
                "canonical_url": bool(re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*>', head_content)),
                "viewport": bool(re.search(r'<meta[^>]*name=["\']viewport["\'][^>]*>', head_content)),
                "og_title": bool(re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*>', head_content)),
                "og_description": bool(re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*>', head_content)),
                "og_url": bool(re.search(r'<meta[^>]*property=["\']og:url["\'][^>]*>', head_content)),
                "twitter_card": bool(re.search(r'<meta[^>]*name=["\']twitter:card["\'][^>]*>', head_content)),
                "structured_data": bool(re.search(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>', content))
            }
            
            # Check title length (50-60 characters optimal)
            title_match = re.search(r'<title[^>]*>([^<]+)</title>', head_content)
            title_length = len(title_match.group(1)) if title_match else 0
            title_length_ok = 50 <= title_length <= 70
            
            # Check meta description length (120-160 characters optimal)
            desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']', head_content)
            desc_length = len(desc_match.group(1)) if desc_match else 0
            desc_length_ok = 120 <= desc_length <= 170
            
            seo_score = sum(seo_checks.values()) + int(title_length_ok) + int(desc_length_ok)
            total_checks = len(seo_checks) + 2  # +2 for title and description length
            
            seo_results[page] = {
                "status": "PASS" if seo_score >= total_checks * 0.8 else "FAIL",
                "score": f"{seo_score}/{total_checks}",
                "checks": seo_checks,
                "title_length": title_length,
                "title_length_ok": title_length_ok,
                "description_length": desc_length,
                "description_length_ok": desc_length_ok
            }
        
        self.report["seo_optimization"] = seo_results
        return seo_results

    def validate_responsiveness(self):
        """Validate responsive design elements"""
        print("🔍 Validating Responsiveness...")
        
        responsive_results = {}
        
        for page in self.core_pages:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check responsive design elements
            responsive_checks = {
                "viewport_meta": bool(re.search(r'<meta[^>]*name=["\']viewport["\'][^>]*>', content)),
                "tailwind_responsive": bool(re.search(r'(sm:|md:|lg:|xl:)', content)),
                "container_responsive": bool(re.search(r'container mx-auto', content)),
                "grid_responsive": bool(re.search(r'grid.*md:', content)),
                "flex_responsive": bool(re.search(r'flex.*md:', content)),
                "padding_responsive": bool(re.search(r'p(x|y)?-\d+.*md:', content)),
                "text_responsive": bool(re.search(r'text-(sm|lg|xl|2xl|3xl|4xl|5xl)', content)),
                "hidden_mobile": bool(re.search(r'hidden.*md:flex', content))
            }
            
            responsive_score = sum(responsive_checks.values())
            total_checks = len(responsive_checks)
            
            responsive_results[page] = {
                "status": "PASS" if responsive_score >= total_checks * 0.7 else "FAIL",
                "score": f"{responsive_score}/{total_checks}",
                "checks": responsive_checks
            }
        
        self.report["responsiveness"] = responsive_results
        return responsive_results

    def validate_adsense_compliance(self):
        """Validate AdSense compliance elements"""
        print("🔍 Validating AdSense Compliance...")
        
        adsense_results = {}
        
        # Check for AdSense-friendly content structure
        for page in self.core_pages:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # AdSense compliance checks
            compliance_checks = {
                "has_quality_content": len(re.findall(r'<p[^>]*>.*?</p>', content)) >= 5,
                "proper_headings": bool(re.search(r'<h[1-6][^>]*>.*?</h[1-6]>', content)),
                "no_popup_ads": "popup" not in content.lower(),
                "clean_layout": bool(re.search(r'bg-white.*rounded.*shadow', content)),
                "footer_present": bool(re.search(r'<footer[^>]*>', content)),
                "contact_info": "support@convertwiz.in" in content,
                "privacy_policy_linked": "privacy.html" in content,
                "terms_linked": "terms.html" in content
            }
            
            # Check content quality indicators
            word_count = len(re.findall(r'\b\w+\b', content))
            has_sufficient_content = word_count >= 300
            
            compliance_score = sum(compliance_checks.values()) + int(has_sufficient_content)
            total_checks = len(compliance_checks) + 1
            
            adsense_results[page] = {
                "status": "PASS" if compliance_score >= total_checks * 0.8 else "FAIL",
                "score": f"{compliance_score}/{total_checks}",
                "checks": compliance_checks,
                "word_count": word_count,
                "sufficient_content": has_sufficient_content
            }
        
        self.report["adsense_compliance"] = adsense_results
        return adsense_results

    def calculate_overall_score(self):
        """Calculate overall validation score"""
        scores = []
        
        # Calculate individual section scores
        for section_name, section_data in [
            ("navigation_consistency", self.report["navigation_consistency"]),
            ("seo_optimization", self.report["seo_optimization"]),
            ("responsiveness", self.report["responsiveness"]),
            ("adsense_compliance", self.report["adsense_compliance"])
        ]:
            if section_data:
                passed = sum(1 for result in section_data.values() if result.get("status") == "PASS")
                total = len(section_data)
                section_score = (passed / total * 100) if total > 0 else 0
                scores.append(section_score)
        
        overall_score = sum(scores) / len(scores) if scores else 0
        self.report["overall_score"] = round(overall_score, 1)
        
        return overall_score

    def generate_recommendations(self):
        """Generate improvement recommendations"""
        recommendations = []
        
        # Check for common issues and provide recommendations
        for page, nav_data in self.report["navigation_consistency"].items():
            if nav_data.get("status") == "FAIL":
                if nav_data.get("missing_links"):
                    recommendations.append(f"Add missing navigation links to {page}: {', '.join(nav_data['missing_links'])}")
                if not nav_data.get("consistent_styling"):
                    recommendations.append(f"Update navigation styling in {page} to match design system")
        
        for page, seo_data in self.report["seo_optimization"].items():
            if seo_data.get("status") == "FAIL":
                if not seo_data["checks"].get("meta_description"):
                    recommendations.append(f"Add meta description to {page}")
                if not seo_data.get("title_length_ok"):
                    recommendations.append(f"Optimize title length in {page} (current: {seo_data['title_length']} chars, optimal: 50-70)")
                if not seo_data.get("description_length_ok"):
                    recommendations.append(f"Optimize meta description length in {page} (current: {seo_data['description_length']} chars, optimal: 120-170)")
        
        self.report["recommendations"] = recommendations
        return recommendations

    def run_full_validation(self):
        """Run complete validation suite"""
        print("🚀 Starting ConvertWiz Navigation & SEO Validation")
        print("=" * 60)
        
        # Run all validation checks
        self.validate_navigation_consistency()
        self.validate_seo_optimization()
        self.validate_responsiveness()
        self.validate_adsense_compliance()
        
        # Calculate scores and recommendations
        overall_score = self.calculate_overall_score()
        self.generate_recommendations()
        
        # Generate summary
        print(f"\n📊 VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Overall Score: {overall_score}%")
        
        # Section summaries
        for section_name, section_data in [
            ("Navigation Consistency", self.report["navigation_consistency"]),
            ("SEO Optimization", self.report["seo_optimization"]),
            ("Responsiveness", self.report["responsiveness"]),
            ("AdSense Compliance", self.report["adsense_compliance"])
        ]:
            if section_data:
                passed = sum(1 for result in section_data.values() if result.get("status") == "PASS")
                total = len(section_data)
                print(f"{section_name}: {passed}/{total} pages passed")
        
        # Recommendations
        if self.report["recommendations"]:
            print(f"\n🔧 RECOMMENDATIONS:")
            for i, rec in enumerate(self.report["recommendations"], 1):
                print(f"{i}. {rec}")
        
        # Save detailed report
        with open('navigation_seo_validation_report.json', 'w') as f:
            json.dump(self.report, f, indent=2)
        
        print(f"\n✅ Detailed report saved to: navigation_seo_validation_report.json")
        
        return self.report

if __name__ == "__main__":
    validator = ConvertWizValidator()
    validator.run_full_validation()