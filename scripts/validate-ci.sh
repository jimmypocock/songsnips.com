#!/bin/bash

echo "🔍 Validating CI/CD Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub Actions workflows exist
echo "Checking GitHub Actions workflows..."
WORKFLOWS=(".github/workflows/ci.yml" ".github/workflows/deploy.yml" ".github/workflows/preview.yml" ".github/workflows/release.yml")

for workflow in "${WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo -e "${GREEN}✓${NC} Found $workflow"
  else
    echo -e "${RED}✗${NC} Missing $workflow"
  fi
done

echo ""

# Check package.json scripts
echo "Checking required npm scripts..."
REQUIRED_SCRIPTS=("lint" "typecheck" "test" "test:coverage" "build" "export")

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\":" package.json; then
    echo -e "${GREEN}✓${NC} Found npm script: $script"
  else
    echo -e "${RED}✗${NC} Missing npm script: $script"
  fi
done

echo ""

# Check for test files
echo "Checking test coverage..."
TEST_COUNT=$(find . -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | wc -l | tr -d ' ')
E2E_COUNT=$(find cypress/e2e -name "*.cy.ts" 2>/dev/null | wc -l | tr -d ' ')

echo -e "${GREEN}✓${NC} Found $TEST_COUNT unit/integration test files"
echo -e "${GREEN}✓${NC} Found $E2E_COUNT E2E test files"

echo ""

# Check environment variables
echo "Checking for .env.example..."
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓${NC} Found .env.example"
else
  echo -e "${YELLOW}⚠${NC} Missing .env.example - consider adding for documentation"
fi

echo ""

# List required GitHub secrets
echo "Required GitHub Secrets:"
echo "  ${YELLOW}AWS Deployment:${NC}"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - AWS_REGION"
echo "  - S3_BUCKET_NAME"
echo "  - CLOUDFRONT_DISTRIBUTION_ID"
echo ""
echo "  ${YELLOW}Application:${NC}"
echo "  - NEXT_PUBLIC_GA_ID"
echo "  - NEXT_PUBLIC_API_URL"
echo ""
echo "  ${YELLOW}Optional:${NC}"
echo "  - VERCEL_TOKEN (for preview deployments)"
echo "  - SLACK_WEBHOOK (for notifications)"
echo "  - SNYK_TOKEN (for security scanning)"

echo ""
echo "✅ CI/CD setup validation complete!"
echo ""
echo "Next steps:"
echo "1. Configure the required secrets in GitHub repository settings"
echo "2. Enable GitHub Actions in repository settings"
echo "3. Set up branch protection rules for 'main' branch"
echo "4. Create a test PR to verify workflows"