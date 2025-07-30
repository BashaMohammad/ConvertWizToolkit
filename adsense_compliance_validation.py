#!/usr/bin/env python3
"""
ConvertWiz AdSense Compliance Validation Suite
Comprehensive end-to-end testing for AdSense approval readiness
"""

import os
import re
import json
import requests
from datetime import datetime
from pathlib import Path

class AdSenseComplianceValidator:
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'overall_score': 0,
            'tests': {},
            'recommendations': []
        }
        
        # Core pages to validate
        self.core_pages = [
            'index.html',
            'about.html', 
            'faq.html',
            'privacy.html',
            'terms.html',
            'disclaimer.html',
            'credits.html',
            'blog/index.html'
        ]
        
        # Blog articles
        self.blog_articles = [
            'blog/jpg-to-png-complete-guide.html',
            'blog/instagram-dp-resizer-guide.html', 
            'blog/word-counter-writing-guide.html',
            'blog/dpi-checker-print-guide.html',
            'blog/global-land-units-conversion-guide.html'
        ]
        
    def validate_content_quality(self):
        """Check content quality and length for AdSense compliance"""
        print("🔍 Validating Content Quality...")
        
        content_scores = {}
        
        for page in self.core_pages + self.blog_articles:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove HTML tags for text analysis
            text_content = re.sub('<[^<]+?>', '', content)
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            word_count = len(text_content.split())
            
            score = {
                'word_count': word_count,
                'meets_minimum': word_count >= 300,  # AdSense minimum
                'substantial_content': word_count >= 500,
                'has_headings': len(re.findall(r'<h[1-6][^>]*>', content)) >= 3,
                'has_images': len(re.findall(r'<img[^>]*>', content)) >= 1,
                'has_meta_description': '<meta name="description"' in content,
                'has_title': '<title>' in content and len(re.findall(r'<title>([^<]+)</title>', content)) > 0
            }
            
            content_scores[page] = score
            
        self.results['tests']['content_quality'] = content_scores
        return content_scores
    
    def validate_navigation_links(self):
        """Check for broken internal links"""
        print("🔗 Validating Navigation Links...")
        
        link_validation = {}
        
        for page in self.core_pages + self.blog_articles:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all internal links
            links = re.findall(r'href="([^"#]*\.html[^"]*)"', content)
            
            page_results = {
                'total_links': len(links),
                'broken_links': [],
                'valid_links': []
            }
            
            for link in links:
                # Handle relative paths
                if link.startswith('../'):
                    link_path = link[3:]
                elif '/' in page and not link.startswith('/'):
                    link_path = link
                else:
                    link_path = link
                    
                if os.path.exists(link_path):
                    page_results['valid_links'].append(link)
                else:
                    page_results['broken_links'].append(link)
            
            link_validation[page] = page_results
            
        self.results['tests']['navigation_links'] = link_validation
        return link_validation
    
    def validate_legal_compliance(self):
        """Check for required legal pages and proper linking"""
        print("⚖️ Validating Legal Compliance...")
        
        required_pages = ['privacy.html', 'terms.html', 'disclaimer.html']
        legal_compliance = {}
        
        for page in required_pages:
            if os.path.exists(page):
                with open(page, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check content length and key sections
                word_count = len(re.sub('<[^<]+?>', '', content).split())
                
                legal_compliance[page] = {
                    'exists': True,
                    'word_count': word_count,
                    'substantial': word_count >= 500,
                    'has_contact_info': 'support@convertwiz.in' in content,
                    'updated_recently': '2025' in content
                }
            else:
                legal_compliance[page] = {'exists': False}
        
        # Check if legal pages are linked from main pages
        for main_page in ['index.html', 'about.html', 'faq.html']:
            if os.path.exists(main_page):
                with open(main_page, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                legal_compliance[f'{main_page}_links'] = {
                    'links_to_privacy': 'privacy.html' in content,
                    'links_to_terms': 'terms.html' in content,
                    'links_to_disclaimer': 'disclaimer.html' in content
                }
        
        self.results['tests']['legal_compliance'] = legal_compliance
        return legal_compliance
    
    def validate_seo_optimization(self):
        """Check SEO compliance for search visibility"""
        print("🔍 Validating SEO Optimization...")
        
        seo_scores = {}
        
        for page in self.core_pages + self.blog_articles:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract title and meta description
            title_match = re.search(r'<title>([^<]+)</title>', content)
            desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
            
            title = title_match.group(1) if title_match else ""
            description = desc_match.group(1) if desc_match else ""
            
            seo_scores[page] = {
                'has_title': bool(title),
                'title_length_ok': 30 <= len(title) <= 70 if title else False,
                'has_meta_description': bool(description),
                'description_length_ok': 120 <= len(description) <= 170 if description else False,
                'has_h1_tag': '<h1' in content,
                'has_alt_tags': 'alt=' in content,
                'has_open_graph': 'og:title' in content,
                'has_canonical': 'rel="canonical"' in content
            }
        
        self.results['tests']['seo_optimization'] = seo_scores
        return seo_scores
    
    def validate_performance_issues(self):
        """Check for performance and technical issues"""
        print("⚡ Validating Performance...")
        
        performance_issues = {
            'large_files': [],
            'external_dependencies': [],
            'inline_styles': 0,
            'javascript_errors': []
        }
        
        # Check file sizes
        for page in self.core_pages + self.blog_articles:
            if os.path.exists(page):
                file_size = os.path.getsize(page) / 1024  # KB
                if file_size > 500:  # Flag files larger than 500KB
                    performance_issues['large_files'].append({
                        'file': page,
                        'size_kb': round(file_size, 2)
                    })
        
        # Check for external dependencies in main page
        if os.path.exists('index.html'):
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find external CDN links
            cdn_links = re.findall(r'https://[^"\']+(?:cdn|googleapis|jsdelivr|unpkg)[^"\']*', content)
            performance_issues['external_dependencies'] = list(set(cdn_links))
            
            # Count inline styles
            performance_issues['inline_styles'] = len(re.findall(r'style="[^"]*"', content))
        
        self.results['tests']['performance'] = performance_issues
        return performance_issues
    
    def validate_user_experience(self):
        """Check user experience factors"""
        print("👥 Validating User Experience...")
        
        ux_validation = {}
        
        for page in self.core_pages:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            ux_validation[page] = {
                'has_navigation': 'nav' in content or 'menu' in content,
                'has_footer': '<footer' in content,
                'mobile_responsive': 'viewport' in content and 'responsive' in content,
                'has_contact_info': 'support@convertwiz.in' in content,
                'clear_purpose': 'convert' in content.lower() or 'tool' in content.lower(),
                'professional_design': 'bg-gradient' in content and 'backdrop-blur' in content
            }
        
        self.results['tests']['user_experience'] = ux_validation
        return ux_validation
    
    def check_admin_links_hidden(self):
        """Verify admin links are properly hidden"""
        print("🔒 Checking Admin Links Hidden...")
        
        admin_check = {}
        
        for page in self.core_pages + self.blog_articles:
            if not os.path.exists(page):
                continue
                
            with open(page, 'r', encoding='utf-8') as f:
                content = f.read()
            
            admin_check[page] = {
                'admin_link_hidden': '<!-- <a href="admin.html"' in content or '<!-- <a href="../admin.html"' in content,
                'no_active_admin_links': 'href="admin.html"' not in content and 'href="../admin.html"' not in content or ('<!--' in content and 'admin.html' in content)
            }
        
        self.results['tests']['admin_links_hidden'] = admin_check
        return admin_check
    
    def generate_recommendations(self):
        """Generate recommendations based on test results"""
        recommendations = []
        
        # Content quality recommendations
        content_tests = self.results['tests'].get('content_quality', {})
        for page, score in content_tests.items():
            if not score.get('meets_minimum', False):
                recommendations.append(f"📝 {page}: Increase content to at least 300 words (currently {score.get('word_count', 0)} words)")
            
            if not score.get('has_meta_description', False):
                recommendations.append(f"🏷️ {page}: Add meta description for SEO")
        
        # Link validation recommendations  
        link_tests = self.results['tests'].get('navigation_links', {})
        for page, links in link_tests.items():
            if links.get('broken_links'):
                recommendations.append(f"🔗 {page}: Fix broken links: {', '.join(links['broken_links'])}")
        
        # Legal compliance recommendations
        legal_tests = self.results['tests'].get('legal_compliance', {})
        for page, compliance in legal_tests.items():
            if not compliance.get('exists', True):
                recommendations.append(f"⚖️ Missing required legal page: {page}")
        
        self.results['recommendations'] = recommendations
        return recommendations
    
    def calculate_overall_score(self):
        """Calculate overall AdSense readiness score"""
        scores = []
        
        # Content quality score (40% weight)
        content_tests = self.results['tests'].get('content_quality', {})
        content_score = 0
        if content_tests:
            total_content_checks = 0
            passed_content_checks = 0
            
            for page, score in content_tests.items():
                for check, result in score.items():
                    if isinstance(result, bool):
                        total_content_checks += 1
                        if result:
                            passed_content_checks += 1
            
            content_score = (passed_content_checks / total_content_checks * 100) if total_content_checks > 0 else 0
        
        scores.append(('Content Quality', content_score, 0.4))
        
        # Navigation score (20% weight)
        link_tests = self.results['tests'].get('navigation_links', {})
        navigation_score = 0
        if link_tests:
            total_links = sum(page.get('total_links', 0) for page in link_tests.values())
            broken_links = sum(len(page.get('broken_links', [])) for page in link_tests.values())
            navigation_score = ((total_links - broken_links) / total_links * 100) if total_links > 0 else 100
        
        scores.append(('Navigation', navigation_score, 0.2))
        
        # Legal compliance score (20% weight)
        legal_tests = self.results['tests'].get('legal_compliance', {})
        legal_score = 0
        if legal_tests:
            required_pages = ['privacy.html', 'terms.html', 'disclaimer.html']
            legal_score = sum(legal_tests.get(page, {}).get('exists', False) for page in required_pages) / len(required_pages) * 100
        
        scores.append(('Legal Compliance', legal_score, 0.2))
        
        # SEO score (10% weight)
        seo_tests = self.results['tests'].get('seo_optimization', {})
        seo_score = 0
        if seo_tests:
            total_seo_checks = 0
            passed_seo_checks = 0
            
            for page, score in seo_tests.items():
                for check, result in score.items():
                    if isinstance(result, bool):
                        total_seo_checks += 1
                        if result:
                            passed_seo_checks += 1
            
            seo_score = (passed_seo_checks / total_seo_checks * 100) if total_seo_checks > 0 else 0
        
        scores.append(('SEO Optimization', seo_score, 0.1))
        
        # UX score (10% weight)
        ux_tests = self.results['tests'].get('user_experience', {})
        ux_score = 0
        if ux_tests:
            total_ux_checks = 0
            passed_ux_checks = 0
            
            for page, score in ux_tests.items():
                for check, result in score.items():
                    if isinstance(result, bool):
                        total_ux_checks += 1
                        if result:
                            passed_ux_checks += 1
            
            ux_score = (passed_ux_checks / total_ux_checks * 100) if total_ux_checks > 0 else 0
        
        scores.append(('User Experience', ux_score, 0.1))
        
        # Calculate weighted overall score
        overall_score = sum(score * weight for _, score, weight in scores)
        self.results['overall_score'] = round(overall_score, 1)
        self.results['score_breakdown'] = scores
        
        return overall_score
    
    def run_all_tests(self):
        """Run complete AdSense compliance validation"""
        print("🚀 Starting ConvertWiz AdSense Compliance Validation...")
        print("=" * 70)
        
        # Run all validation tests
        self.validate_content_quality()
        self.validate_navigation_links()
        self.validate_legal_compliance()
        self.validate_seo_optimization()
        self.validate_performance_issues()
        self.validate_user_experience()
        self.check_admin_links_hidden()
        
        # Generate recommendations and calculate score
        self.generate_recommendations()
        overall_score = self.calculate_overall_score()
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 ADSENSE COMPLIANCE VALIDATION SUMMARY")
        print("=" * 70)
        print(f"Overall AdSense Readiness Score: {overall_score:.1f}%")
        
        if overall_score >= 90:
            print("🎉 EXCELLENT - Ready for AdSense submission!")
        elif overall_score >= 80:
            print("✅ GOOD - Minor improvements recommended")
        elif overall_score >= 70:
            print("⚠️ ACCEPTABLE - Several improvements needed")
        else:
            print("❌ NEEDS WORK - Address critical issues before submission")
        
        # Show score breakdown
        print(f"\nScore Breakdown:")
        for category, score, weight in self.results['score_breakdown']:
            print(f"  {category}: {score:.1f}% (weight: {weight*100:.0f}%)")
        
        # Show recommendations
        if self.results['recommendations']:
            print(f"\n📋 Recommendations ({len(self.results['recommendations'])} items):")
            for i, rec in enumerate(self.results['recommendations'][:10], 1):
                print(f"  {i}. {rec}")
            
            if len(self.results['recommendations']) > 10:
                print(f"  ... and {len(self.results['recommendations']) - 10} more items")
        
        # Save detailed report
        with open('adsense_compliance_final_report.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📝 Detailed report saved to: adsense_compliance_final_report.json")
        return self.results

def main():
    validator = AdSenseComplianceValidator()
    return validator.run_all_tests()

if __name__ == "__main__":
    main()