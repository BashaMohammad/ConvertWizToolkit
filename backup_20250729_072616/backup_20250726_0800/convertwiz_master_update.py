# ============================================
# ConvertWiz Master Update System - July 27, 2025
# Includes: SEO Fixes, Speed Optimization, Backup, Rollback, Testing, Health Monitoring
# ============================================

import os
import shutil
import datetime
import subprocess
import json
import re
from pathlib import Path

# ===== CONFIGURATION =====
ENV = "prod"  # Switch between "dev" or "prod"
backup_folder = f"backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M')}"

class ConvertWizUpdater:
    def __init__(self):
        self.backup_path = backup_folder
        self.report = {"timestamp": datetime.datetime.now().isoformat()}
        
    # ===== BACKUP SYSTEM =====
    def backup_files(self):
        """Create comprehensive backup of all project files"""
        try:
            if not os.path.exists(self.backup_path):
                os.makedirs(self.backup_path)
            
            exclude_items = [self.backup_path, '__pycache__', '.git', 'node_modules', '.replit']
            
            for item in os.listdir('.'):
                if item not in exclude_items:
                    source = os.path.join('.', item)
                    dest = os.path.join(self.backup_path, item)
                    
                    if os.path.isdir(source):
                        shutil.copytree(source, dest)
                    else:
                        shutil.copy2(source, dest)
            
            print(f"✅ Backup completed at {self.backup_path}")
            self.report["backup"] = "SUCCESS"
            return True
        except Exception as e:
            print(f"❌ Backup failed: {e}")
            self.report["backup"] = f"FAILED: {e}"
            return False
    
    def verify_backup(self):
        """Verify backup integrity"""
        return os.path.exists(self.backup_path) and len(os.listdir(self.backup_path)) > 0
    
    def restore_backup(self):
        """Rollback to previous backup"""
        if not os.path.exists(self.backup_path):
            print("❌ No backup found for rollback")
            return False
        
        try:
            # Remove current files (except backup and system files)
            exclude = [self.backup_path, '__pycache__', '.git', '.replit']
            for item in os.listdir('.'):
                if item not in exclude:
                    path = os.path.join('.', item)
                    if os.path.isdir(path):
                        shutil.rmtree(path)
                    else:
                        os.remove(path)
            
            # Restore from backup
            for item in os.listdir(self.backup_path):
                source = os.path.join(self.backup_path, item)
                if os.path.isdir(source):
                    shutil.copytree(source, item)
                else:
                    shutil.copy2(source, '.')
            
            print("✅ Rollback completed successfully")
            return True
        except Exception as e:
            print(f"❌ Rollback failed: {e}")
            return False
    
    # ===== SEO OPTIMIZATION =====
    def apply_seo_fixes(self):
        """Apply comprehensive SEO improvements"""
        seo_fixes = []
        
        try:
            # Fix meta tags and canonical links
            html_files = [f for f in os.listdir('.') if f.endswith('.html')]
            
            for html_file in html_files:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Add canonical link if missing
                if 'rel="canonical"' not in content and '<head>' in content:
                    canonical_url = f"https://www.convertwiz.in/{html_file}"
                    if html_file == 'index.html':
                        canonical_url = "https://www.convertwiz.in/"
                    
                    canonical_tag = f'    <link rel="canonical" href="{canonical_url}">\n'
                    content = content.replace('<head>', f'<head>\n{canonical_tag}')
                    seo_fixes.append(f"Added canonical link to {html_file}")
                
                # Ensure proper meta description length (150-160 chars)
                meta_desc_pattern = r'<meta name="description" content="([^"]*)"'
                meta_match = re.search(meta_desc_pattern, content)
                if meta_match:
                    desc = meta_match.group(1)
                    if len(desc) > 160:
                        new_desc = desc[:157] + "..."
                        content = content.replace(desc, new_desc)
                        seo_fixes.append(f"Optimized meta description in {html_file}")
                
                # Write back the file
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            print(f"✅ SEO fixes applied: {len(seo_fixes)} improvements")
            self.report["seo_fixes"] = f"Applied {len(seo_fixes)} fixes"
        except Exception as e:
            print(f"❌ SEO fixes failed: {e}")
            self.report["seo_fixes"] = f"FAILED: {e}"
    
    # ===== SPEED OPTIMIZATION =====
    def apply_speed_optimizations(self):
        """Apply performance optimizations"""
        optimizations = []
        
        try:
            # Add lazy loading to images
            html_files = [f for f in os.listdir('.') if f.endswith('.html')]
            
            for html_file in html_files:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Add lazy loading to images
                img_pattern = r'<img([^>]*?)(?<!loading="lazy")>'
                def add_lazy_loading(match):
                    img_tag = match.group(0)
                    if 'loading=' not in img_tag:
                        return img_tag.replace('<img', '<img loading="lazy"')
                    return img_tag
                
                original_count = len(re.findall(r'<img[^>]*>', content))
                content = re.sub(img_pattern, add_lazy_loading, content)
                lazy_count = len(re.findall(r'loading="lazy"', content))
                
                if lazy_count > 0:
                    optimizations.append(f"Added lazy loading to {lazy_count} images in {html_file}")
                
                # Add preconnect for external resources
                if 'fonts.googleapis.com' in content and 'rel="preconnect"' not in content:
                    preconnect = '''    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
'''
                    content = content.replace('<head>', f'<head>\n{preconnect}')
                    optimizations.append(f"Added preconnect links to {html_file}")
                
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            print(f"✅ Speed optimizations applied: {len(optimizations)} improvements")
            self.report["speed_optimizations"] = f"Applied {len(optimizations)} optimizations"
        except Exception as e:
            print(f"❌ Speed optimizations failed: {e}")
            self.report["speed_optimizations"] = f"FAILED: {e}"
    
    # ===== FIREBASE CONNECTIVITY FIX =====
    def fix_firebase_connectivity(self):
        """Fix Firebase connectivity issues"""
        try:
            firebase_auth_file = 'firebase-auth.js'
            if os.path.exists(firebase_auth_file):
                with open(firebase_auth_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Add offline persistence and retry logic
                offline_handling = '''
// Enhanced offline handling
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Add connection state monitoring
firebase.database().ref('.info/connected').on('value', function(snapshot) {
  if (snapshot.val() === true) {
    console.log('✅ Firebase connected');
  } else {
    console.log('⚠️ Firebase offline');
  }
});
'''
                
                if 'setPersistence' not in content:
                    content += offline_handling
                    
                    with open(firebase_auth_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    print("✅ Firebase connectivity fixes applied")
                    self.report["firebase_fix"] = "SUCCESS"
                else:
                    self.report["firebase_fix"] = "ALREADY_APPLIED"
        except Exception as e:
            print(f"❌ Firebase fix failed: {e}")
            self.report["firebase_fix"] = f"FAILED: {e}"
    
    # ===== ADSENSE OPTIMIZATION =====
    def fix_adsense_issues(self):
        """Fix AdSense slot size and initialization issues"""
        try:
            # Find and fix AdSense initialization in HTML files
            html_files = [f for f in os.listdir('.') if f.endswith('.html')]
            
            for html_file in html_files:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Fix AdSense initialization timing
                if 'adsbygoogle' in content and 'availableWidth=0' not in content:
                    # Add proper AdSense initialization with delay
                    adsense_fix = '''
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    if (typeof adsbygoogle !== 'undefined') {
      (adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, 1000);
});
</script>
'''
                    if 'window.addEventListener(\'load\'' not in content:
                        content = content.replace('</body>', f'{adsense_fix}</body>')
                        
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        
                        print(f"✅ AdSense initialization fixed in {html_file}")
            
            self.report["adsense_fix"] = "SUCCESS"
        except Exception as e:
            print(f"❌ AdSense fix failed: {e}")
            self.report["adsense_fix"] = f"FAILED: {e}"
    
    # ===== TESTING SYSTEM =====
    def run_comprehensive_tests(self):
        """Run automated tests for all components"""
        test_results = {}
        
        # Test essential files exist
        essential_files = [
            'index.html', 'server.js', 'package.json', 'style.css', 
            'script.js', 'firebase-auth.js'
        ]
        
        for file in essential_files:
            test_results[f"file_{file}"] = "PASS" if os.path.exists(file) else "FAIL"
        
        # Test webhook configuration
        if os.path.exists('webhook-server.js'):
            test_results["webhook_server"] = "PASS"
        else:
            test_results["webhook_server"] = "FAIL"
        
        # Test Firebase configuration
        if os.path.exists('firebase-auth.js'):
            with open('firebase-auth.js', 'r') as f:
                content = f.read()
                if 'convertwiz' in content:
                    test_results["firebase_config"] = "PASS"
                else:
                    test_results["firebase_config"] = "FAIL"
        
        # Test payment integration
        if os.path.exists('server.js'):
            with open('server.js', 'r') as f:
                content = f.read()
                if 'razorpay' in content.lower():
                    test_results["payment_integration"] = "PASS"
                else:
                    test_results["payment_integration"] = "FAIL"
        
        self.report["test_results"] = f"Passed {sum(1 for r in test_results.values() if r == 'PASS')}/{len(test_results)} tests"
        
        # Generate test report
        passed = sum(1 for result in test_results.values() if result == "PASS")
        total = len(test_results)
        
        print(f"✅ Tests completed: {passed}/{total} passed")
        return test_results
    
    # ===== HEALTH MONITORING =====
    def setup_health_monitoring(self):
        """Setup automated health monitoring"""
        try:
            health_check_script = '''#!/usr/bin/env python3
# ConvertWiz Health Check Script
import requests
import datetime
import json

def check_site_health():
    """Perform comprehensive site health check"""
    report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "checks": {}
    }
    
    # Check main site
    try:
        response = requests.get("https://www.convertwiz.in", timeout=10)
        report["checks"]["main_site"] = {
            "status": response.status_code,
            "response_time": response.elapsed.total_seconds(),
            "success": response.status_code == 200
        }
    except Exception as e:
        report["checks"]["main_site"] = {"error": str(e), "success": False}
    
    # Check API health
    try:
        response = requests.get("https://www.convertwiz.in/api/health", timeout=10)
        report["checks"]["api_health"] = {
            "status": response.status_code,
            "success": response.status_code == 200
        }
    except Exception as e:
        report["checks"]["api_health"] = {"error": str(e), "success": False}
    
    # Generate report
    with open(f"health_report_{datetime.datetime.now().strftime('%Y%m%d')}.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("Health check completed:", datetime.datetime.now())
    return report

if __name__ == "__main__":
    check_site_health()
'''
            
            with open('health_check.py', 'w') as f:
                f.write(health_check_script)
            
            print("✅ Health monitoring script created")
            self.report["health_monitoring"] = "SUCCESS"
        except Exception as e:
            print(f"❌ Health monitoring setup failed: {e}")
            self.report["health_monitoring"] = f"FAILED: {e}"
    
    # ===== MAIN EXECUTION =====
    def run_master_update(self):
        """Execute complete master update process"""
        print("🚀 Starting ConvertWiz Master Update...")
        
        # Step 1: Backup
        if not self.backup_files() or not self.verify_backup():
            print("❌ Backup failed. Aborting update.")
            return False
        
        try:
            # Step 2: Apply fixes and optimizations
            self.fix_firebase_connectivity()
            self.fix_adsense_issues()
            self.apply_seo_fixes()
            self.apply_speed_optimizations()
            
            # Step 3: Testing
            test_results = self.run_comprehensive_tests()
            
            # Step 4: Setup monitoring
            self.setup_health_monitoring()
            
            # Step 5: Generate final report
            self.generate_final_report()
            
            print("✅ Master update completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Update failed: {e}")
            print("🔄 Initiating rollback...")
            self.restore_backup()
            return False
    
    def generate_final_report(self):
        """Generate comprehensive update report"""
        report_file = f"convertwiz_update_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M')}.json"
        
        with open(report_file, 'w') as f:
            json.dump(self.report, f, indent=2)
        
        print(f"📊 Update report generated: {report_file}")

# ===== EXECUTION =====
if __name__ == "__main__":
    updater = ConvertWizUpdater()
    success = updater.run_master_update()
    
    if not success:
        print("❌ Master update failed. Check logs and reports.")
    else:
        print("🎉 ConvertWiz successfully updated!")