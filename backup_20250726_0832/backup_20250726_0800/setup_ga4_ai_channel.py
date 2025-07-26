#!/usr/bin/env python3
"""
ConvertWiz GA4 AI Traffic Channel Setup
Sets up custom channel group for AI referral traffic tracking
"""

from google.analytics.admin import AnalyticsAdminServiceClient
from google.analytics.admin_v1alpha.types import ChannelGroup, ChannelGroupFilter
import json

def setup_ga4_ai_channel():
    """
    Creates a custom channel group in GA4 to track AI referral traffic
    Requires GA4 Admin API credentials and property access
    """
    
    # Initialize the Analytics Admin client
    # Note: Requires service account JSON file or environment credentials
    client = AnalyticsAdminServiceClient()
    
    # Replace with your GA4 Property ID (format: properties/XXXXXXXXX)
    property_id = "properties/YOUR_GA4_PROPERTY_ID"
    
    # Define AI referral sources
    ai_sources = [
        "chat.openai.com",
        "chatgpt.com", 
        "perplexity.ai",
        "gemini.google.com",
        "claude.ai",
        "bard.google.com",
        "you.com",
        "poe.com",
        "character.ai"
    ]
    
    # Create channel group for AI referrals
    channel_group = ChannelGroup(
        display_name="AI Referral Traffic",
        description="Custom channel group to track traffic from AI assistants and chatbots"
    )
    
    # Add channel group filter rules
    for source in ai_sources:
        filter_rule = ChannelGroupFilter(
            filter_name=f"AI Referral - {source}",
            string_filter={
                "match_type": "CONTAINS",
                "value": source,
                "case_sensitive": False
            },
            field_name="sessionSource"
        )
        channel_group.grouping_rule.append(filter_rule)
    
    try:
        # Create the channel group
        response = client.create_channel_group(
            parent=property_id,
            channel_group=channel_group
        )
        
        print("✅ GA4 AI Referral channel group created successfully!")
        print(f"Channel Group ID: {response.name}")
        print(f"Display Name: {response.display_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating channel group: {str(e)}")
        print("\nSetup Instructions:")
        print("1. Install required packages: pip install google-analytics-admin")
        print("2. Set up service account credentials")
        print("3. Replace YOUR_GA4_PROPERTY_ID with actual property ID")
        print("4. Ensure you have Admin access to the GA4 property")
        
        return False

def create_looker_studio_template():
    """
    Creates a Looker Studio dashboard template configuration for AI traffic
    """
    template_config = {
        "dashboard_name": "ConvertWiz AI Traffic Analysis",
        "data_source": "GA4 Property",
        "charts": [
            {
                "type": "time_series",
                "title": "AI Referral Traffic Over Time",
                "dimensions": ["Date"],
                "metrics": ["Sessions", "Users"],
                "filters": ["sessionSource CONTAINS chat.openai.com OR perplexity.ai"]
            },
            {
                "type": "pie_chart", 
                "title": "AI Source Distribution",
                "dimensions": ["sessionSource"],
                "metrics": ["Sessions"],
                "filters": ["sessionSource CONTAINS ai OR chat"]
            },
            {
                "type": "table",
                "title": "Top Converting AI Sources",
                "dimensions": ["sessionSource", "landingPage"],
                "metrics": ["Sessions", "conversions", "conversionRate"]
            }
        ]
    }
    
    with open('looker_studio_ai_template.json', 'w') as f:
        json.dump(template_config, f, indent=2)
    
    print("✅ Looker Studio template configuration created!")
    print("File: looker_studio_ai_template.json")

if __name__ == "__main__":
    print("🤖 ConvertWiz GA4 AI Traffic Setup")
    print("=" * 40)
    
    # Setup AI channel group
    setup_ga4_ai_channel()
    
    # Create Looker Studio template
    create_looker_studio_template()
    
    print("\n📊 Next Steps:")
    print("1. Run this script with proper GA4 Admin credentials")
    print("2. Import looker_studio_ai_template.json into Looker Studio")
    print("3. Connect your GA4 property as data source")
    print("4. Monitor AI referral traffic in your dashboard")