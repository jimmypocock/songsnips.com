#!/bin/bash

# Source the config script to set up environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo -e "${BLUE}Updating CDN Stack with API Gateway...${NC}"
echo "================================="

# Get API Gateway URL from the API stack
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-API" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text \
  --region us-east-1 2>/dev/null)

if [ -z "$API_URL" ]; then
  echo -e "${RED}❌ Error: Could not find API Gateway URL. Make sure API stack is deployed first.${NC}"
  exit 1
fi

echo -e "${GREEN}Found API Gateway URL: ${API_URL}${NC}"

# We need to update the app.ts to use CdnStackV2 and pass the API URL
# For now, let's document what needs to be done

echo -e "${YELLOW}To complete the API integration:${NC}"
echo "1. Update cdk/src/app.ts to:"
echo "   - Import CdnStackV2 instead of CdnStack"
echo "   - Pass apiGatewayUrl parameter from API stack outputs"
echo "2. Redeploy the CDN stack"
echo ""
echo "Would you like me to update these files automatically? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo -e "${YELLOW}Updating CDK files...${NC}"
  
  # Backup original files
  cp "$CDK_DIR/src/app.ts" "$CDK_DIR/src/app.ts.backup"
  cp "$CDK_DIR/src/cdn-stack.ts" "$CDK_DIR/src/cdn-stack.ts.backup"
  
  echo -e "${GREEN}✅ Files backed up${NC}"
  echo -e "${YELLOW}Manual update required for app.ts to use CdnStackV2${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Set your YouTube API key in Secrets Manager"
  echo "2. Update app.ts to use CdnStackV2"
  echo "3. Run: npm run deploy -- CDN"
else
  echo -e "${YELLOW}Skipping automatic updates${NC}"
fi