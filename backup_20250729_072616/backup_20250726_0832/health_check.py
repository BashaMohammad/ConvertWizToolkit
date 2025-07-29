#!/usr/bin/env python3
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
