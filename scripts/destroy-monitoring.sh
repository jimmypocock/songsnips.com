#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🗑️  Destroying Monitoring Stack..."
echo "📝 Stack name: $MONITORING_STACK"
echo "⚠️  WARNING: This will remove all alarms and dashboards!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

cd cdk
npx cdk destroy "$MONITORING_STACK" --force "$@"
cd ..

echo "✅ Monitoring stack destroyed"