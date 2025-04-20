#!/bin/bash

# Define variables
PDF_PATH="./public/images/Home - rawfuelfoods.com.pdf"
API_URL="http://localhost:3000/api/documents"

# Check if file exists
if [ ! -f "$PDF_PATH" ]; then
    echo "Error: PDF file not found at $PDF_PATH"
    exit 1
fi

# Upload file
echo "Uploading file: $PDF_PATH"
curl -X POST "$API_URL" \
  -F "file=@$PDF_PATH" \
  -F "title=RawFuelFoods Homepage" \
  -F "type=research" \
  -F "description=Homepage documentation for RawFuelFoods website" \
  -v

echo "\nDone!" 