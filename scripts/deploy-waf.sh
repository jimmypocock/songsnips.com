#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🛡️  Deploying WAF Stack..."
echo "📝 Stack name: $WAF_STACK"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Build CDK if needed
cd cdk
if [ ! -d "node_modules" ]; then
    npm install
fi
rm -f lib/*.d.ts lib/*.js
npm run build

# Deploy only the WAF stack
echo "☁️  Deploying WAF rules..."
npx cdk deploy "$WAF_STACK" --require-approval never "$@"

cd ..

echo "✅ WAF deployment complete!"