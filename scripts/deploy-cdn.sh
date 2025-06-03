#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🌐 Deploying CDN Stack..."
echo "📝 Stack name: $CDN_STACK"

# Check if we should build NextJS
BUILD_NEXTJS=false
for arg in "$@"; do
    if [[ $arg == "--nextjs" ]]; then
        BUILD_NEXTJS=true
    fi
done

# Build NextJS if requested
if [ "$BUILD_NEXTJS" = true ]; then
    echo "🏗️  Building NextJS application..."
    npm install
    npm run build
fi

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

# Deploy CDN stack
echo "☁️  Deploying CDN distribution..."
npx cdk deploy "$CDN_STACK" --require-approval never --context createCertificate=true "$@"

cd ..

# Upload content to S3 after CDN is deployed
if [ "$BUILD_NEXTJS" = true ] || [ -d "out" ]; then
    echo "📦 Uploading NextJS build to S3..."

    # Get bucket name from stack
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$FOUNDATION_STACK" \
        --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
        --output text \
        --region us-east-1)

    if [ -n "$BUCKET_NAME" ]; then
        # Sync NextJS output to S3
        aws s3 sync out/ s3://$BUCKET_NAME/ \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "*.html" || true

        # HTML files get shorter cache
        aws s3 sync out/ s3://$BUCKET_NAME/ \
            --delete \
            --cache-control "public, max-age=3600" \
            --exclude "*" \
            --include "*.html" || true

        # Invalidate CloudFront
        DIST_ID=$(aws cloudformation describe-stacks \
            --stack-name "$CDN_STACK" \
            --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
            --output text \
            --region us-east-1)

        if [ -n "$DIST_ID" ]; then
            echo "🔄 Invalidating CloudFront cache..."
            aws cloudfront create-invalidation \
                --distribution-id $DIST_ID \
                --paths "/*" \
                --output table
        fi
    fi
fi

echo "✅ CDN deployment complete!"
echo ""
echo "📋 Your site is available at:"
echo "   https://www.$DOMAIN_NAME"