#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🗑️  Destroying WAF Stack..."
echo "📝 Stack name: $WAF_STACK"
echo "⚠️  WARNING: This will remove all WAF rules and rate limiting!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

cd cdk
npx cdk destroy "$WAF_STACK" --force "$@"
cd ..

echo "✅ WAF stack destroyed"