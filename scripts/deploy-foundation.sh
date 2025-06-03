#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🏗️  Deploying Foundation Stack (S3 Buckets)..."
echo "📝 Stack name: $FOUNDATION_STACK"
echo "⚠️  This stack has termination protection enabled"

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

# Deploy foundation stack
echo "☁️  Deploying foundation resources..."
npx cdk deploy "$FOUNDATION_STACK" --require-approval never "$@"

cd ..

echo "✅ Foundation deployment complete!"
echo ""
echo "📋 Created resources:"
echo "   - Content bucket for website files"
echo "   - Logs bucket for CloudFront logs"
echo ""
echo "⚠️  These buckets have RETAIN policy - they won't be deleted with the stack"