#!/bin/bash

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🔍 Checking SSL status for www.$DOMAIN_NAME..."

# Check SSL certificate
echo "Certificate details:"
echo | openssl s_client -servername www.$DOMAIN_NAME -connect www.$DOMAIN_NAME:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer

echo ""
echo "🌐 Testing site accessibility:"
curl -I -s https://www.$DOMAIN_NAME | head -3

echo ""
echo "Testing /how-it-works route:"
curl -I -s https://www.$DOMAIN_NAME/how-it-works | head -3