#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

PROFILE_ARG=""
if [ -n "$AWS_PROFILE" ]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
fi

# Function to enable maintenance mode
enable_maintenance() {
    echo "🔧 Enabling maintenance mode..."
    
    # Get the S3 bucket name from Foundation stack
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$FOUNDATION_STACK" \
        --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
        --output text \
        --region us-east-1 \
        $PROFILE_ARG)
    
    if [ -z "$BUCKET_NAME" ]; then
        echo "❌ Could not find S3 bucket. Is the Foundation stack deployed?"
        exit 1
    fi
    
    echo "📦 Uploading maintenance page to S3..."
    
    # Upload maintenance page as index.html (this replaces the site)
    aws s3 cp public/maintenance.html s3://$BUCKET_NAME/index.html \
        --content-type "text/html" \
        --cache-control "no-cache, no-store, must-revalidate" \
        $PROFILE_ARG
    
    # Copy maintenance page to all common routes
    for route in "_next" "favicon.ico" "404.html"; do
        aws s3 cp public/maintenance.html s3://$BUCKET_NAME/$route \
            --content-type "text/html" \
            --cache-control "no-cache, no-store, must-revalidate" \
            $PROFILE_ARG 2>/dev/null || true
    done
    
    # Get CloudFront distribution ID from CDN stack
    DIST_ID=$(aws cloudformation describe-stacks \
        --stack-name "$CDN_STACK" \
        --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
        --output text \
        --region us-east-1 \
        $PROFILE_ARG)
    
    if [ -n "$DIST_ID" ]; then
        echo "🌐 Creating CloudFront invalidation..."
        aws cloudfront create-invalidation \
            --distribution-id $DIST_ID \
            --paths "/*" \
            $PROFILE_ARG \
            --output table
    fi
    
    echo "✅ Maintenance mode enabled!"
    echo "   Your site now shows the maintenance page."
}

# Function to disable maintenance mode
disable_maintenance() {
    echo "🚀 Disabling maintenance mode..."
    
    # Redeploy the application content
    echo "📦 Redeploying the application..."
    ./scripts/deploy-app-content.sh
    
    echo "✅ Maintenance mode disabled!"
    echo "   Your site is back online."
}

# Function to update maintenance message
update_maintenance() {
    local MESSAGE="$1"
    local ETA="$2"
    
    echo "📝 Updating maintenance page..."
    
    # Create a temporary file with custom message
    cp public/maintenance.html /tmp/maintenance-custom.html
    
    if [ -n "$MESSAGE" ]; then
        # Update the message in the temporary file
        sed -i.bak "s/We're currently performing scheduled maintenance to improve your experience./$MESSAGE/g" /tmp/maintenance-custom.html
    fi
    
    if [ -n "$ETA" ]; then
        # Update the ETA
        sed -i.bak "s/<span id=\"eta\">Soon<\/span>/<span id=\"eta\">$ETA<\/span>/g" /tmp/maintenance-custom.html
    fi
    
    # Get bucket name from Foundation stack
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$FOUNDATION_STACK" \
        --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
        --output text \
        --region us-east-1 \
        $PROFILE_ARG)
    
    aws s3 cp /tmp/maintenance-custom.html s3://$BUCKET_NAME/index.html \
        --content-type "text/html" \
        --cache-control "no-cache, no-store, must-revalidate" \
        $PROFILE_ARG
    
    # Invalidate CloudFront
    DIST_ID=$(aws cloudformation describe-stacks \
        --stack-name "$CDN_STACK" \
        --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
        --output text \
        --region us-east-1 \
        $PROFILE_ARG)
    
    if [ -n "$DIST_ID" ]; then
        aws cloudfront create-invalidation \
            --distribution-id $DIST_ID \
            --paths "/index.html" \
            $PROFILE_ARG \
            --output table
    fi
    
    rm -f /tmp/maintenance-custom.html /tmp/maintenance-custom.html.bak
    
    echo "✅ Maintenance page updated!"
}

# Main script logic
case "$1" in
    "on"|"enable")
        enable_maintenance
        ;;
    "off"|"disable")
        disable_maintenance
        ;;
    "update")
        update_maintenance "$2" "$3"
        ;;
    *)
        echo "🔧 Maintenance Mode Manager"
        echo ""
        echo "Usage:"
        echo "  npm run maintenance:on          - Enable maintenance mode"
        echo "  npm run maintenance:off         - Disable maintenance mode"
        echo "  npm run maintenance:update      - Update maintenance message"
        echo ""
        echo "Examples:"
        echo "  npm run maintenance:on"
        echo "  npm run maintenance:update \"Upgrading to new features\" \"2 hours\""
        echo "  npm run maintenance:off"
        exit 1
        ;;
esac