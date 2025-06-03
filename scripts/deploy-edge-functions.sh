#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "⚡ Deploying Edge Functions Stack..."
echo "📝 Stack name: $EDGE_FUNCTIONS_STACK"

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

# Deploy edge functions stack
echo "☁️  Deploying CloudFront functions..."
npx cdk deploy "$EDGE_FUNCTIONS_STACK" --require-approval never "$@"

cd ..

echo "✅ Edge functions deployment complete!"
echo ""
echo "⚠️  Note: CloudFront functions take 5-10 minutes to propagate globally"