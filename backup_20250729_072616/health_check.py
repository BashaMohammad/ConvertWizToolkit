#!/usr/bin/env python3
"""
ConvertWiz Weekly Health Check
Automated monitoring and reporting system
"""

import requests
import datetime
import json

def check_site_health():
    """Comprehensive site health check"""
    base_url = "http://localhost:5000"
    health_report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "healthy",
        "checks": {}
    }
    
    # Check critical endpoints
    endpoints = [
        "/api/health",
        "/",
        "/subscribe.html",
        "/admin.html"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            health_report["checks"][endpoint] = {
                "status": response.status_code,
                "healthy": response.status_code == 200,
                "response_time": response.elapsed.total_seconds()
            }
        except Exception as e:
            health_report["checks"][endpoint] = {
                "status": "error",
                "healthy": False,
                "error": str(e)
            }
    
    # Generate report
    with open(f"weekly_health_{datetime.datetime.now().strftime('%Y%m%d')}.json", "w") as f:
        json.dump(health_report, f, indent=2)
    
    print("Weekly health check completed")
    return health_report

if __name__ == "__main__":
    check_site_health()
