# CI/CD Setup Guide

This document explains the GitHub Actions CI/CD pipeline configuration for SongSnips.

## Overview

The CI/CD pipeline consists of several workflows that handle different aspects of the development lifecycle:

1. **CI Workflow** - Runs on every push and pull request
2. **Deploy Workflow** - Deploys to production on main branch pushes
3. **Preview Workflow** - Creates preview deployments for pull requests
4. **Release Workflow** - Handles versioning and release notes
5. **Dependabot Workflow** - Auto-merges dependency updates

## GitHub Secrets Required

You need to configure the following secrets in your GitHub repository settings:

### AWS Deployment Configuration

#### Option 1: GitHub OIDC with IAM Role (Recommended)
This is the AWS-recommended approach using temporary credentials:

**AWS Configuration Required:**
1. Create an IAM role with trust policy for GitHub OIDC
2. No secrets needed in GitHub (only variables)

**GitHub Variables Required:**
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ROLE_ARN` - IAM role ARN (e.g., arn:aws:iam::123456789012:role/GitHubActionsRole)
- `S3_BUCKET_NAME` - S3 bucket name for hosting
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID

#### Option 2: Long-term Credentials (Not Recommended)
Use only if OIDC is not possible:

- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `S3_BUCKET_NAME` - S3 bucket name for hosting
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID

### Application Secrets
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_API_URL` - API endpoint URL

### Optional Secrets
- `VERCEL_TOKEN` - For preview deployments (if using Vercel)
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SLACK_WEBHOOK` - For deployment notifications
- `SNYK_TOKEN` - For security scanning
- `CODECOV_TOKEN` - For coverage reporting

## Workflow Details

### CI Workflow (.github/workflows/ci.yml)
Runs on every push and PR to ensure code quality:
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests with coverage
- E2E tests (basic smoke tests)
- Security scanning
- Build verification

### Deploy Workflow (.github/workflows/deploy.yml)
Automated deployment to production:
- Triggered on pushes to main branch
- Runs tests before deployment
- Builds and exports static files
- Syncs to S3 with proper cache headers
- Invalidates CloudFront cache
- Sends Slack notifications

### Preview Workflow (.github/workflows/preview.yml)
Creates preview environments for PRs:
- Builds and tests the PR code
- Deploys to Vercel preview environment
- Comments on PR with preview URL
- Updates on new commits

### Release Workflow (.github/workflows/release.yml)
Handles versioning and releases:
- Triggered by version tags (v*)
- Generates changelog
- Creates GitHub release
- Uploads release assets

## Branch Protection Rules

Configure the following branch protection rules for `main`:

1. **Require pull request reviews**
   - Dismiss stale reviews on new commits
   - Require review from code owners

2. **Require status checks**
   - Lint
   - Unit Tests
   - E2E Tests
   - Build

3. **Require branches to be up to date**

4. **Include administrators** (optional)

## Setting Up

### Configure AWS IAM Role for GitHub OIDC (Recommended)

1. **Create IAM Role in AWS Console**
   ```bash
   # Go to IAM > Roles > Create role
   # Select "Web identity" as trusted entity type
   # Choose "GitHub" as identity provider
   # Configure the trust policy (see below)
   ```

2. **Trust Policy for GitHub Actions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
           }
         }
       }
     ]
   }
   ```

3. **Attach Permissions Policy**
   Create a policy with only the permissions needed for deployment:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR_BUCKET_NAME",
           "arn:aws:s3:::YOUR_BUCKET_NAME/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "cloudfront:CreateInvalidation"
         ],
         "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
       }
     ]
   }
   ```

4. **Configure GitHub Variables**
   ```bash
   # Go to Settings > Secrets and variables > Actions > Variables
   # Add the following variables (not secrets):
   # - AWS_REGION
   # - AWS_ROLE_ARN
   # - S3_BUCKET_NAME
   # - CLOUDFRONT_DISTRIBUTION_ID
   ```

5. **Configure Secrets (Application Only)**
   ```bash
   # Go to Settings > Secrets and variables > Actions > Secrets
   # Add only application secrets (no AWS credentials needed)
   ```

2. **Enable GitHub Actions**
   ```bash
   # Go to Settings > Actions > General
   # Select "Allow all actions and reusable workflows"
   ```

3. **Configure Environments** (optional)
   ```bash
   # Go to Settings > Environments
   # Create "production" environment
   # Add protection rules and secrets
   ```

4. **Set Up Branch Protection**
   ```bash
   # Go to Settings > Branches
   # Add rule for "main" branch
   # Configure required status checks
   ```

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Test CI workflow
act -j test

# Test with secrets
act -j deploy --secret-file .env.secrets
```

## Monitoring

- **Actions Tab**: Monitor workflow runs
- **Insights > Actions**: View workflow analytics
- **Settings > Webhooks**: Set up additional notifications

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check Node.js version matches
   - Ensure all dependencies are in package.json
   - Check for environment-specific issues

2. **Deployment fails**
   - Verify AWS credentials are correct
   - Check S3 bucket permissions
   - Ensure CloudFront distribution ID is correct

3. **Preview deployments not working**
   - Verify Vercel tokens are set
   - Check Vercel project configuration

### Debug Mode

Enable debug logging:
```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

## Best Practices

1. **Keep workflows DRY** - Use reusable workflows for common tasks
2. **Cache dependencies** - Already configured with `actions/setup-node`
3. **Use specific versions** - Pin action versions for stability
4. **Fail fast** - Configure matrix builds to fail fast
5. **Timeout limits** - Set reasonable timeouts for long-running jobs

## Cost Optimization

GitHub Actions provides:
- 2,000 minutes/month for free accounts
- 3,000 minutes/month for Pro accounts

To optimize usage:
- Use `paths` filters to skip unnecessary runs
- Cancel in-progress runs on new pushes
- Use self-hosted runners for heavy workloads

## Security Best Practices

### AWS Access Security

1. **Use GitHub OIDC Instead of Long-term Credentials**
   - Eliminates the risk of credential exposure
   - Provides temporary, short-lived credentials
   - Automatically rotated by AWS STS
   - No secrets to manage or rotate

2. **Implement Least-Privilege IAM Policies**
   - Grant only the minimum permissions required
   - Use resource-specific ARNs instead of wildcards
   - Regularly audit and remove unused permissions

3. **Enable AWS CloudTrail**
   - Track all API calls made by the CI/CD pipeline
   - Monitor for unusual activity
   - Set up alerts for sensitive operations

4. **Use External ID for Additional Security** (Optional)
   If you need extra protection against confused deputy attacks:
   ```json
   {
     "Condition": {
       "StringEquals": {
         "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
         "sts:ExternalId": "unique-external-id-for-your-org"
       }
     }
   }
   ```

### GitHub Security

- Never commit secrets to the repository
- Use GitHub's secret scanning
- Enable Dependabot security updates
- Review third-party actions before use
- Use exact versions for GitHub Actions (e.g., `@v4.1.1` not `@v4`)
- Enable branch protection rules
- Require PR reviews for infrastructure changes

### General Security Guidelines

1. **Rotate Credentials Regularly** (if using long-term credentials)
2. **Use Environment-Specific Roles** - Separate roles for dev/staging/prod
3. **Monitor Failed Deployments** - Could indicate compromised credentials
4. **Implement Resource Tagging** - Track resources created by CI/CD
5. **Use AWS Organizations SCPs** - Prevent accidental resource deletion