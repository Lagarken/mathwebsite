#!/bin/bash

# Check if directory is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

DIRECTORY=$1

# Find files with specified extensions and log them
find "$DIRECTORY" -type f \( -name "*.dll" -o -name "*.exe" -o -name "*.bat" -o -name "*.apk" -o -name "*.ipa" -o -name "*.cmd" \) > found_files.log

echo "Files with specified extensions have been logged to found_files.log"