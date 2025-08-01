#!/usr/bin/env python3
"""
ConvertWiz Comprehensive SEO Implementation
Applies all SEO optimizations directly to HTML files for maximum search visibility
"""

import re
import json
from pathlib import Path

class SEOImplementer:
    def __init__(self):
        self.index_file = "index.html"
        
    def read_seo_data(self):
        """Read generated SEO data files"""
        try:
            with open('seo_meta_descriptions.json', 'r') as f:
                self.meta_descriptions = json.load(f)
            with open('seo_structured_data.json', 'r') as f:
                self.structured_data = json.load(f)
            with open('seo_faq_schema.json', 'r') as f:
                self.faq_schema = json.load(f)
            return True
        except FileNotFoundError:
            print("SEO data files not found. Run advanced_seo_optimization.py first.")
            return False
            
    def enhance_meta_tags(self, content):
        """Add comprehensive meta tags to head section"""
        enhanced_meta = '''
    <!-- Advanced SEO Meta Tags -->
    <meta name="description" content="ConvertWiz - Free online conversion tools for images, currency, units, and more. 18+ professional tools with instant results. No signup required.">
    <meta name="keywords" content="online converter, image converter, currency converter, unit converter, jpg to png, free tools, conversion tools">
    <meta name="author" content="ConvertWiz Team">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="bingbot" content="index, follow">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://convertwiz.in/">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://convertwiz.in/">
    <meta property="og:title" content="ConvertWiz - Free Online Conversion Tools">
    <meta property="og:description" content="18+ professional conversion tools for images, currency, units, and more. Free, fast, and secure online converters.">
    <meta property="og:image" content="https://convertwiz.in/assets/og-image.png">
    <meta property="og:site_name" content="ConvertWiz">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://convertwiz.in/">
    <meta property="twitter:title" content="ConvertWiz - Free Online Conversion Tools">
    <meta property="twitter:description" content="18+ professional conversion tools for images, currency, units, and more. Free, fast, and secure online converters.">
    <meta property="twitter:image" content="https://convertwiz.in/assets/twitter-card.png">
    <meta property="twitter:creator" content="@convertwiz">
    <meta property="twitter:site" content="@convertwiz">
    
    <!-- Additional SEO Meta Tags -->
    <meta name="theme-color" content="#8B5CF6">
    <meta name="msapplication-TileColor" content="#8B5CF6">
    <meta name="application-name" content="ConvertWiz">
    <meta name="apple-mobile-web-app-title" content="ConvertWiz">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">
    <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
'''
        
        # Insert after existing meta tags but before title
        title_pattern = r'(<title>.*?</title>)'
        if re.search(title_pattern, content):
            content = re.sub(title_pattern, enhanced_meta + r'\n    \1', content)
        else:
            # Insert after head tag if no title found
            head_pattern = r'(<head[^>]*>)'
            content = re.sub(head_pattern, r'\1' + enhanced_meta, content)
            
        return content
        
    def add_structured_data(self, content):
        """Add comprehensive JSON-LD structured data"""
        organization_schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ConvertWiz",
            "url": "https://convertwiz.in",
            "logo": "https://convertwiz.in/assets/logo.png",
            "description": "Professional online conversion tools for images, currency, units, and digital content",
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@convertwiz.com"
            }
        }
        
        website_schema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ConvertWiz",
            "url": "https://convertwiz.in",
            "description": "Free online conversion tools suite with 18+ professional converters",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://convertwiz.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
        
        webapp_schema = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ConvertWiz Conversion Tools",
            "url": "https://convertwiz.in",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires HTML5 support",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "featureList": [
                "Image format conversion (JPG to PNG)",
                "Real-time currency conversion",
                "Unit and measurement conversion",
                "Text processing tools",
                "QR code generation",
                "Color format conversion",
                "Temperature conversion",
                "Percentage calculations"
            ],
            "screenshot": "https://convertwiz.in/assets/screenshot.png"
        }
        
        faq_schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Is ConvertWiz free to use?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, ConvertWiz is completely free. All 18+ conversion tools are available without registration or payment."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Do I need to create an account?",
                    "acceptedAnswer": {
                        "@type": "Answer", 
                        "text": "No account required. Simply visit any tool page and start converting immediately."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What file formats are supported?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "We support all major formats including JPG, PNG for images, 150+ currencies for conversion, and various unit measurements."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Is my data secure?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, most conversions happen locally in your browser. No files are stored on our servers unnecessarily."
                    }
                }
            ]
        }
        
        schema_scripts = f'''
    <!-- Structured Data / JSON-LD -->
    <script type="application/ld+json">
    {json.dumps(organization_schema, indent=2)}
    </script>
    
    <script type="application/ld+json">
    {json.dumps(website_schema, indent=2)}
    </script>
    
    <script type="application/ld+json">
    {json.dumps(webapp_schema, indent=2)}
    </script>
    
    <script type="application/ld+json">
    {json.dumps(faq_schema, indent=2)}
    </script>
'''
        
        # Insert before closing head tag
        head_close_pattern = r'(</head>)'
        content = re.sub(head_close_pattern, schema_scripts + r'\1', content)
        
        return content
        
    def enhance_semantic_html(self, content):
        """Enhance HTML with semantic elements and ARIA labels"""
        # Add semantic structure improvements
        semantic_improvements = [
            # Add main landmark
            (r'(<div[^>]*class="[^"]*main[^"]*"[^>]*>)', r'<main role="main" \1'),
            # Add navigation landmarks  
            (r'(<nav[^>]*>)', r'\1<span class="sr-only">Main navigation</span>'),
            # Add section landmarks
            (r'(<section[^>]*class="[^"]*tool-section[^"]*")', r'\1 role="region"'),
            # Add article structure
            (r'(<div[^>]*class="[^"]*tool-card[^"]*")', r'<article \1'),
            # Add heading hierarchy
            (r'(<h2[^>]*class="[^"]*tool-title[^"]*")', r'\1 role="heading" aria-level="2"'),
        ]
        
        for pattern, replacement in semantic_improvements:
            content = re.sub(pattern, replacement, content)
            
        return content
        
    def add_breadcrumb_navigation(self, content):
        """Add breadcrumb navigation for better SEO"""
        breadcrumb_html = '''
    <!-- Breadcrumb Navigation -->
    <nav aria-label="Breadcrumb" class="breadcrumb-nav py-2 px-4 text-sm text-gray-600">
        <ol class="flex items-center space-x-2" itemscope itemtype="https://schema.org/BreadcrumbList">
            <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                <a href="/" itemprop="item" class="hover:text-purple-600 transition-colors">
                    <span itemprop="name">Home</span>
                </a>
                <meta itemprop="position" content="1" />
            </li>
        </ol>
    </nav>
'''
        
        # Insert after opening body tag or header
        header_pattern = r'(<header[^>]*>.*?</header>)'
        if re.search(header_pattern, content, re.DOTALL):
            content = re.sub(header_pattern, r'\1' + breadcrumb_html, content, flags=re.DOTALL)
        else:
            body_pattern = r'(<body[^>]*>)'
            content = re.sub(body_pattern, r'\1' + breadcrumb_html, content)
            
        return content
        
    def optimize_images_alt_text(self, content):
        """Add comprehensive alt text to all images"""
        # Pattern to find images without alt text or with empty alt
        img_patterns = [
            (r'<img([^>]*?)src="([^"]*)"([^>]*?)(?:alt="")?([^>]*?)>', 
             lambda m: f'<img{m.group(1)}src="{m.group(2)}" alt="ConvertWiz - {self.generate_alt_text(m.group(2))}"{m.group(3)}{m.group(4)}>'),
        ]
        
        for pattern, replacement in img_patterns:
            content = re.sub(pattern, replacement, content)
            
        return content
        
    def generate_alt_text(self, src):
        """Generate descriptive alt text based on image source"""
        if 'logo' in src.lower():
            return "ConvertWiz Logo - Free Online Conversion Tools"
        elif 'icon' in src.lower():
            return "Tool Icon"
        elif 'tool' in src.lower():
            return "Conversion Tool Interface"
        else:
            return "ConvertWiz Feature Image"
            
    def add_internal_linking(self, content):
        """Add strategic internal links for SEO"""
        # Add contextual internal links
        link_patterns = [
            # Link tool mentions to actual tools
            (r'\b(JPG to PNG)\b(?![^<]*</a>)', r'<a href="/jpg-to-png" class="text-purple-600 hover:underline">\1</a>'),
            (r'\b(Currency Converter)\b(?![^<]*</a>)', r'<a href="/currency-converter" class="text-purple-600 hover:underline">\1</a>'),
            (r'\b(Word Counter)\b(?![^<]*</a>)', r'<a href="/word-counter" class="text-purple-600 hover:underline">\1</a>'),
            (r'\b(Color Picker)\b(?![^<]*</a>)', r'<a href="/color-code-picker" class="text-purple-600 hover:underline">\1</a>'),
        ]
        
        for pattern, replacement in link_patterns:
            content = re.sub(pattern, replacement, content)
            
        return content
        
    def implement_all_seo(self):
        """Apply all SEO optimizations to the index.html file"""
        try:
            with open(self.index_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            print("🔧 Applying SEO optimizations...")
            
            # Apply all optimizations
            content = self.enhance_meta_tags(content)
            content = self.add_structured_data(content)
            content = self.enhance_semantic_html(content)
            content = self.add_breadcrumb_navigation(content)
            content = self.optimize_images_alt_text(content)
            content = self.add_internal_linking(content)
            
            # Write optimized content back
            with open(self.index_file, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print("✅ SEO optimizations applied successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error applying SEO optimizations: {e}")
            return False

if __name__ == "__main__":
    implementer = SEOImplementer()
    
    print("🚀 ConvertWiz Comprehensive SEO Implementation")
    print("=" * 55)
    
    success = implementer.implement_all_seo()
    
    if success:
        print("\n✅ All SEO optimizations implemented:")
        print("  📋 Enhanced meta tags and descriptions")
        print("  🏗️ JSON-LD structured data added")
        print("  🔗 Internal linking optimized")
        print("  🖼️ Image alt text enhanced")
        print("  🧭 Breadcrumb navigation added")
        print("  📱 Semantic HTML improvements")
        print("\n🎯 Expected Results:")
        print("  • Better search engine rankings")
        print("  • Enhanced rich snippets")
        print("  • Improved click-through rates")
        print("  • Faster indexing by search engines")
    else:
        print("❌ SEO implementation failed. Check file permissions and try again.")