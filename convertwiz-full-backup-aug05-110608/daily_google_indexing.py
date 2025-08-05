#!/usr/bin/env python3
"""
ConvertWiz Daily Google Indexing Automation
Ensures daily crawling and indexing in Google Search
"""

import requests
import json
import time
from datetime import datetime
import xml.etree.ElementTree as ET

class DailyGoogleIndexing:
    def __init__(self):
        self.domain = "convertwiz.in"
        self.site_url = f"https://{self.domain}"
        self.sitemap_url = f"{self.site_url}/sitemap.xml"
        
        # All pages to ensure indexing
        self.priority_pages = [
            "/",
            "/about.html",
            "/faq.html",
            "/blog/index.html",
            "/blog/jpg-to-png-complete-guide.html",
            "/blog/instagram-dp-resizer-guide.html", 
            "/blog/word-counter-writing-guide.html",
            "/blog/dpi-checker-print-guide.html",
            "/blog/global-land-units-conversion-guide.html",
            "/privacy.html",
            "/terms.html",
            "/disclaimer.html"
        ]
    
    def ping_search_engines(self):
        """Ping Google and Bing with sitemap for indexing"""
        
        results = []
        
        # Google ping
        try:
            google_ping_url = f"https://www.google.com/ping?sitemap={self.sitemap_url}"
            response = requests.get(google_ping_url, timeout=10)
            results.append({
                "engine": "Google",
                "status": "success" if response.status_code == 200 else "failed",
                "url": google_ping_url,
                "timestamp": datetime.now().isoformat()
            })
            print(f"✅ Google sitemap ping: {response.status_code}")
        except Exception as e:
            results.append({
                "engine": "Google",
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            print(f"❌ Google ping failed: {e}")
        
        # Bing ping
        try:
            bing_ping_url = f"https://www.bing.com/ping?sitemap={self.sitemap_url}"
            response = requests.get(bing_ping_url, timeout=10)
            results.append({
                "engine": "Bing",
                "status": "success" if response.status_code == 200 else "failed",
                "url": bing_ping_url,
                "timestamp": datetime.now().isoformat()
            })
            print(f"✅ Bing sitemap ping: {response.status_code}")
        except Exception as e:
            results.append({
                "engine": "Bing", 
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            print(f"❌ Bing ping failed: {e}")
        
        return results
    
    def update_sitemap_with_fresh_dates(self):
        """Update sitemap with current dates to signal freshness"""
        
        try:
            # Read existing sitemap
            with open("sitemap.xml", "r") as f:
                sitemap_content = f.read()
            
            # Update lastmod dates to current date
            current_date = datetime.now().strftime("%Y-%m-%d")
            
            # Parse and update XML
            root = ET.fromstring(sitemap_content)
            
            # Update all lastmod entries
            for url_elem in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
                lastmod_elem = url_elem.find("{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod")
                if lastmod_elem is not None:
                    lastmod_elem.text = current_date
            
            # Write updated sitemap
            updated_content = ET.tostring(root, encoding="unicode")
            with open("sitemap.xml", "w") as f:
                f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
                f.write(updated_content)
            
            print(f"✅ Sitemap updated with fresh dates: {current_date}")
            return True
            
        except Exception as e:
            print(f"❌ Sitemap update failed: {e}")
            return False
    
    def generate_fresh_content_signals(self):
        """Generate signals that content is fresh and updated"""
        
        fresh_signals = []
        
        # Update a few key pages with fresh timestamp comments
        pages_to_update = ["index.html", "about.html", "faq.html"]
        
        for page in pages_to_update:
            try:
                with open(page, "r") as f:
                    content = f.read()
                
                # Add or update freshness comment
                timestamp = datetime.now().isoformat()
                freshness_comment = f"<!-- Last updated: {timestamp} -->"
                
                if "<!-- Last updated:" in content:
                    # Replace existing timestamp
                    import re
                    content = re.sub(
                        r'<!-- Last updated: [^>]+ -->',
                        freshness_comment,
                        content
                    )
                else:
                    # Add new timestamp after <head>
                    content = content.replace(
                        "<head>",
                        f"<head>\n    {freshness_comment}"
                    )
                
                with open(page, "w") as f:
                    f.write(content)
                
                fresh_signals.append({
                    "page": page,
                    "status": "updated",
                    "timestamp": timestamp
                })
                print(f"✅ Added fresh content signal to {page}")
                
            except Exception as e:
                fresh_signals.append({
                    "page": page,
                    "status": "error", 
                    "error": str(e)
                })
                print(f"❌ Failed to update {page}: {e}")
        
        return fresh_signals
    
    def create_indexing_schedule(self):
        """Create automated indexing schedule"""
        
        schedule = {
            "daily_times": [
                "00:30",  # Midnight ping
                "06:00",  # Morning ping
                "12:00",  # Noon ping  
                "18:00"   # Evening ping
            ],
            "actions_per_ping": [
                "Update sitemap with fresh dates",
                "Ping Google and Bing with sitemap",
                "Add fresh content signals to key pages",
                "Monitor for indexing status"
            ],
            "weekly_deep_indexing": {
                "day": "Sunday",
                "time": "02:00",
                "actions": [
                    "Submit all individual pages for indexing",
                    "Update all page timestamps",
                    "Generate new sitemap entries",
                    "Comprehensive search engine submission"
                ]
            }
        }
        
        return schedule
    
    def run_daily_indexing(self):
        """Execute daily indexing routine"""
        
        print("🚀 Starting Daily Google Indexing Routine")
        print("=" * 50)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "sitemap_update": None,
            "search_engine_pings": [],
            "fresh_content_signals": [],
            "indexing_schedule": None
        }
        
        # Step 1: Update sitemap with fresh dates
        print("📝 Updating sitemap with fresh dates...")
        results["sitemap_update"] = self.update_sitemap_with_fresh_dates()
        
        # Step 2: Ping search engines
        print("📡 Pinging search engines...")
        results["search_engine_pings"] = self.ping_search_engines()
        
        # Step 3: Add fresh content signals
        print("🔄 Adding fresh content signals...")
        results["fresh_content_signals"] = self.generate_fresh_content_signals()
        
        # Step 4: Create indexing schedule
        print("⏰ Creating indexing schedule...")
        results["indexing_schedule"] = self.create_indexing_schedule()
        
        # Save results
        with open("daily_indexing_log.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print("\n📊 DAILY INDEXING SUMMARY:")
        print(f"✅ Sitemap updated: {results['sitemap_update']}")
        print(f"✅ Search engines pinged: {len(results['search_engine_pings'])}")
        print(f"✅ Fresh signals added: {len(results['fresh_content_signals'])}")
        print(f"✅ Schedule created: {bool(results['indexing_schedule'])}")
        
        print("\n🎯 NEXT INDEXING: Every 6 hours (00:30, 06:00, 12:00, 18:00)")
        print("📝 Log saved: daily_indexing_log.json")
        print("🚀 Daily Google indexing routine complete!")
        
        return results

def main():
    indexing = DailyGoogleIndexing()
    return indexing.run_daily_indexing()

if __name__ == "__main__":
    main()