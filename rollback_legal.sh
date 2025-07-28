#!/bin/bash
# ConvertWiz Legal Pages Rollback Script
# Created: July 29, 2025

echo "🔄 Starting ConvertWiz Legal Pages Rollback..."

# Check if backup exists
if [ ! -d "backup_2025_07_29" ]; then
    echo "❌ Error: Backup folder 'backup_2025_07_29' not found!"
    exit 1
fi

# Restore files from backup
echo "📁 Restoring files from backup..."
cp backup_2025_07_29/privacy.html . && echo "✅ privacy.html restored"
cp backup_2025_07_29/terms.html . && echo "✅ terms.html restored"

echo "🎉 Rollback complete! Legal pages restored to pre-AdSense state."
echo "ℹ️  Backup preserved in backup_2025_07_29/ folder"