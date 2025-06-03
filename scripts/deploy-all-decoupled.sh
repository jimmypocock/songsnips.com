#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🚀 Deploying All Stacks (Decoupled Architecture)..."

# Pass all arguments to each deployment script
ARGS="$@"

# Check if NextJS build is requested
BUILD_NEXTJS=false
for arg in "$@"; do
    if [[ $arg == "--nextjs" ]]; then
        BUILD_NEXTJS=true
    fi
done

# Build NextJS once if requested
if [ "$BUILD_NEXTJS" = true ]; then
    echo "🏗️  Building NextJS application..."
    npm install
    npm run build
fi

# Check if foundation exists
FOUNDATION_EXISTS=$(aws cloudformation describe-stacks --stack-name "$FOUNDATION_STACK" --region us-east-1 2>&1 | grep -c "$FOUNDATION_STACK" || true)

if [ "$FOUNDATION_EXISTS" -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "1/6: Deploying Foundation Stack"
    echo "========================================="
    ./scripts/deploy-foundation.sh $ARGS
else
    echo "✅ Foundation stack already exists"
fi

# Check if certificate exists
CERT_EXISTS=$(aws cloudformation describe-stacks --stack-name "$CERTIFICATE_STACK" --region us-east-1 2>&1 | grep -c "$CERTIFICATE_STACK" || true)

if [ "$CERT_EXISTS" -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "2/6: Deploying Certificate Stack"
    echo "========================================="
    echo "⚠️  Certificate creation requires DNS validation!"
    ./scripts/deploy-cert.sh $ARGS
else
    echo "✅ Certificate configured"
fi

# Deploy Edge Functions
echo ""
echo "========================================="
echo "3/6: Deploying Edge Functions Stack"
echo "========================================="
./scripts/deploy-edge-functions.sh $ARGS

# Deploy WAF
echo ""
echo "========================================="
echo "4/6: Deploying WAF Stack"
echo "========================================="
./scripts/deploy-waf.sh $ARGS

# Deploy CDN
echo ""
echo "========================================="
echo "5/7: Deploying CDN Stack"
echo "========================================="
# Don't pass --nextjs again since we already built it
./scripts/deploy-cdn.sh ${ARGS//--nextjs/}

# Deploy App Content
echo ""
echo "========================================="
echo "6/7: Deploying Application Content"
echo "========================================="
./scripts/deploy-app-content.sh $ARGS

# Deploy Monitoring
echo ""
echo "========================================="
echo "7/7: Deploying Monitoring Stack"
echo "========================================="
./scripts/deploy-monitoring.sh $ARGS

echo ""
echo "========================================="
echo "✅ ALL STACKS DEPLOYED SUCCESSFULLY!"
echo "========================================="
echo ""
echo "📋 Your infrastructure:"
echo "   Foundation:     S3 buckets for content and logs"
echo "   Certificate:    SSL/TLS certificate"
echo "   Edge Functions: URL redirects and security headers"
echo "   WAF:           Rate limiting and security rules"
echo "   CDN:           CloudFront distribution"
echo "   App:           Application content deployment"
echo "   Monitoring:    CloudWatch dashboards and alerts"
echo ""
echo "🌐 Your site is available at:"
echo "   https://www.$DOMAIN_NAME"
echo ""
echo "📊 CloudWatch Dashboard:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:"

# Check if notification email was provided
for arg in "$@"; do
    if [[ $arg == *"notificationEmail="* ]]; then
        EMAIL=$(echo $arg | cut -d'=' -f2)
        echo ""
        echo "📧 Remember to check $EMAIL for SNS subscription confirmation!"
    fi
done