#!/bin/bash

# Source the config script to set up environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo -e "${BLUE}Deploying API Stack...${NC}"
echo "================================="

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Navigate to CDK directory
cd "$CDK_DIR" || exit 1

# Install dependencies for Lambda layer
echo -e "${YELLOW}Installing Lambda layer dependencies...${NC}"
cd "lambda-layers/dependencies/nodejs" || exit 1
npm install --production
cd "$CDK_DIR" || exit 1

# Build CDK if needed
if [ ! -d "node_modules" ]; then
    npm install
fi
rm -f lib/*.d.ts lib/*.js
npm run build

# Deploy API stack
echo -e "${YELLOW}Deploying API stack...${NC}"
npx cdk deploy "$API_STACK" --require-approval never "$@"

echo -e "${GREEN}✅ API stack deployment complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to set the YouTube API key in AWS Secrets Manager${NC}"
echo "1. Go to AWS Secrets Manager in the console"
echo "2. Find the secret named '${DOMAIN_NAME}-youtube-api-key'"
echo "3. Click 'Retrieve secret value' and then 'Edit'"
echo "4. Set the secret value to your YouTube Data API v3 key"
echo ""
echo "To get a YouTube API key:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Enable YouTube Data API v3"
echo "4. Create credentials (API Key)"
echo "5. Optionally restrict the key to your API Gateway URL"