#!/bin/bash

# Script to deploy application content to S3
# This should be run after all infrastructure is deployed

set -e

# Load configuration
source "$(dirname "$0")/config.sh"

echo "🚀 Deploying Application Content..."
echo "📝 Stack name: $APP_STACK"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if stack exists
check_stack_exists() {
    local stack_name=$1
    aws cloudformation describe-stacks --stack-name "$stack_name" --region us-east-1 &>/dev/null
    return $?
}

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE${NC}"
    exit 1
fi

# Check prerequisites
echo "Checking prerequisites..."

# Check if Foundation stack is deployed
if ! check_stack_exists "$FOUNDATION_STACK"; then
    echo -e "${RED}❌ Error: $FOUNDATION_STACK stack not found. Deploy foundation first.${NC}"
    exit 1
fi

# Check if CDN stack is deployed
if ! check_stack_exists "$CDN_STACK"; then
    echo -e "${RED}❌ Error: $CDN_STACK stack not found. Deploy CDN first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisite stacks found${NC}"

# Change to CDK directory
cd "$(dirname "$0")/../cdk"

# Clean and build the project
echo "Building CDK project..."
rm -rf lib/*.d.ts lib/*.js
npm run build

# Deploy App stack
echo "Deploying $APP_STACK stack..."
npx cdk deploy "$APP_STACK" --require-approval never

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application content deployed successfully!${NC}"
    
    # Get CloudFront distribution URL
    DISTRIBUTION_URL=$(aws cloudformation describe-stacks \
        --stack-name "$CDN_STACK" \
        --region us-east-1 \
        --query 'Stacks[0].Outputs[?OutputKey==`DistributionUrl`].OutputValue' \
        --output text)
    
    if [ -n "$DISTRIBUTION_URL" ]; then
        echo -e "\n${GREEN}🌐 Your application is available at:${NC}"
        echo -e "${YELLOW}   $DISTRIBUTION_URL${NC}"
    fi
else
    echo -e "${RED}❌ Application deployment failed${NC}"
    exit 1
fi