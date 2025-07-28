#!/bin/bash
# Backup critical files before component isolation fix
BACKUP_DIR="backup_component_critical_fix_$(date +%Y%m%d_%H%M)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in $BACKUP_DIR..."
cp index.html "$BACKUP_DIR/"
cp style.css "$BACKUP_DIR/"
cp app.js "$BACKUP_DIR/"
cp tools.js "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
echo "Files backed up:"
ls -la "$BACKUP_DIR"