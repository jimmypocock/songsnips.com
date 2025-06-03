# Deployment Guide for this NextJS template

This guide explains how to deploy the this app to AWS using CDK.

## Overview

This application is deployed to AWS and includes:

- CloudFront distribution with WAF protection
- S3 static hosting with NextJS static export
- SSL certificate management
- CloudWatch monitoring and alerting
- Google Analytics integration
- Security headers and rate limiting

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure the AWS CLI

   ```bash
   # For standard AWS credentials
   aws configure

   # For AWS SSO
   aws sso login --profile your-profile-name
   export AWS_PROFILE=your-profile-name
   ```

3. **Node.js**: Version 18.x or later
4. **Domain**: yourdomainname.com (configure DNS after deployment)

## Architecture

The deployment is split into separate stacks for better modularity:

- **Foundation Stack**: S3 buckets for website content and logs
- **Certificate Stack**: ACM SSL/TLS certificate management
- **Edge Functions Stack**: CloudFront Functions for redirects and headers
- **WAF Stack**: Web Application Firewall with rate limiting
- **CDN Stack**: CloudFront distribution
- **App Stack**: Website content deployment
- **Monitoring Stack**: CloudWatch dashboards, alarms, and SNS notifications

## Initial Setup

1. **Install dependencies**:

   ```bash
   npm install
   cd cdk && npm install && cd ..
   ```

2. **Set up Google Analytics** (optional):
   - Create a Google Analytics 4 property
   - Add your GA Measurement ID to `.env`: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-ID`

2. **Create ACM Certificate** (choose one option):

   **Option A: Create via CDK (Recommended)**

   ```bash
   # Deploy with certificate creation
   npm run deploy -- -c createCertificate=true
   ```

   After deployment:
   1. **Find validation records**: Go to AWS Certificate Manager → Your certificate → Copy CNAME records
   2. **Add BOTH validation records to DNS provider**:
      - **For non-www domain**:
        - Type: CNAME
        - Name: Use only the prefix part (e.g., if AWS shows `_abc123def.yourdomainname.com`, use only `_abc123def`)
        - Value: Use the full value as shown (e.g., `_xyz789.acm-validations.aws.`)
      - **For www subdomain**:
        - Type: CNAME
        - Name: Use the prefix WITH www (e.g., if AWS shows `_abc123def.www.yourdomainname.com`, use `_abc123def.www`)
        - Value: Use the full value as shown
      - **Important**: Your DNS provider will automatically append your domain to the name field
   3. **Wait for validation** (5-30 minutes) - status will change to "Issued" for BOTH domains
   4. **Save certificate ARN**:

      ```bash
      # Copy .env.example to .env
      cp .env.example .env
      ```

   **Option B: Create manually in AWS Console**
   - Go to AWS Certificate Manager in us-east-1 region
   - Request a public certificate for:
     - `yourdomainname.com`
     - `www.yourdomainname.com`
   - Choose DNS validation
   - Add the CNAME records to your DNS
   - Wait for validation
   - Copy the certificate ARN

## Deployment Steps

You can deploy stacks individually or all at once. The decoupled architecture allows for independent deployment and management of each component.

### Setting up Email Notifications

To receive alerts for billing thresholds and errors:

```bash
npm run deploy -- -c notificationEmail=your-email@example.com
```

You'll receive an email from AWS SNS to confirm your subscription.

### First Deployment (Decoupled Stacks)

Deploy all stacks at once:

```bash
npm run deploy:all:decoupled -- -c createCertificate=true -c notificationEmail=your-email@example.com
```

Or deploy individually in order:

```bash
# 1. Foundation (S3 buckets)
npm run deploy:foundation

# 2. Certificate (if creating new)
npm run deploy:cert -- -c createCertificate=true
# Save the certificate ARN to .env after validation

# 3. Edge Functions
npm run deploy:edge

# 4. WAF (optional)
npm run deploy:waf

# 5. CDN
npm run deploy:cdn

# 6. Application content
npm run deploy:app

# 7. Monitoring (optional)
npm run deploy:monitoring -- -c notificationEmail=your-email@example.com
```

### Subsequent Deployments

Update everything:
```bash
npm run deploy:all:decoupled
```

Or update specific stacks:
```bash
npm run deploy:app  # Just update website content
npm run deploy:cdn          # Update CDN configuration
```

### Starting Fresh (Complete Redeploy)

If you need to delete and recreate everything:
1. **Keep your certificate** - it's already validated and can be reused
2. Delete stacks in reverse order:
   ```bash
   npm run destroy:monitoring
   npm run destroy:waf
   aws cloudformation delete-stack --stack-name YourStackName-App
   aws cloudformation delete-stack --stack-name YourStackName-CDN
   aws cloudformation delete-stack --stack-name YourStackName-EdgeFunctions
   aws cloudformation delete-stack --stack-name YourStackName-Certificate
   aws cloudformation delete-stack --stack-name YourStackName-Foundation
   ```
3. Deploy fresh: `npm run deploy:all:decoupled` (uses certificate from .env)

### Manual Certificate Override

```bash
npm run deploy -- -c certificateArn=arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID
```

### With AWS SSO Profile

```bash
# Option 1: Set profile for session
export AWS_PROFILE=your-profile-name
npm run deploy

# Option 2: Pass profile directly
npm run deploy -- --profile your-profile-name
```

The deploy script automatically:

- Checks AWS credentials
- Installs dependencies (if needed)
- Builds TypeScript
- Bootstraps CDK (first time only)
- Deploys the stack

## Post-Deployment

**⚠️ IMPORTANT**: Complete these steps AFTER deployment finishes successfully!

1. **Note the CloudFront distribution domain** from the deployment output (e.g., `d1234abcd.cloudfront.net`)
2. **Configure DNS** (only after CloudFront is deployed):
   - **Option A - Route 53 (Recommended)**:
     - Create ALIAS record for `www.yourdomainname.com` → CloudFront distribution
     - Create ALIAS record for `yourdomainname.com` → CloudFront distribution
   - **Option B - Other DNS Providers**:
     - Create CNAME record for `www` → CloudFront distribution domain
     - Create CNAME record for `@` → CloudFront distribution domain
3. **Wait for DNS propagation** (5 minutes to 48 hours, typically 1-2 hours)
4. **Note**: CloudFront updates take 15-20 minutes to propagate globally

## Redirect Behavior

The CloudFront Function (Lambda@Edge) handles these redirects:

- `https://xyz.cloudfront.net` → `https://www.yourdomainname.com`
- `https://yourdomainname.com` → `https://www.yourdomainname.com`

- All traffic is forced to HTTPS (HTTP automatically redirects to HTTPS)

The primary domain is `www.yourdomainname.com` - all other URLs redirect to it.

## Updating the Site

To update the website content:

```bash
# Just deploy the application content
npm run deploy:app
```

This only updates the S3 content and invalidates the CloudFront cache, without touching infrastructure.

## Useful Commands

- `npm run validate` - Check for circular dependencies and configuration issues
- `npm run cdk:diff` - Compare deployed stacks with current state
- `npm run cdk:synth` - Synthesize CloudFormation templates
- Individual stack commands:
  - `npm run deploy:foundation` - Deploy S3 buckets
  - `npm run deploy:cert` - Deploy certificate
  - `npm run deploy:edge` - Deploy CloudFront functions
  - `npm run deploy:waf` - Deploy WAF rules
  - `npm run deploy:cdn` - Deploy CloudFront distribution
  - `npm run deploy:app` - Deploy website content
  - `npm run deploy:monitoring` - Deploy monitoring

## Cost Considerations

- **S3**: ~$0.023/GB/month for storage
- **CloudFront**: ~$0.085/GB for data transfer
- **CloudFront Functions**: ~$0.10 per 1 million invocations
- **WAF**: ~$5/month + $0.60 per million requests
- **Route 53**: ~$0.50/month per hosted zone
- **CloudWatch**: ~$0.30/GB for logs ingestion

For a low-traffic site, expect ~$6-10/month (mainly WAF costs).

**Billing Alerts**: The stack automatically creates alerts at $10, $50, and $100 thresholds.

## Troubleshooting

### Certificate Issues

- Ensure certificate is in us-east-1 region
- Verify both domains are included in the certificate
- Check BOTH validation records are added (www and non-www)
- Check certificate is validated and issued for BOTH domains
- Verify validation with: `dig _prefix.yourdomainname.com CNAME +short`

### Deployment Failures

- Check AWS credentials: `aws sts get-caller-identity`
- Ensure you have necessary IAM permissions
- Review CloudFormation events in AWS Console
- If TypeScript errors occur, delete .d.ts files: `rm -f lib/*.d.ts`

### 403 Forbidden Errors

Common causes and solutions:
1. **CloudFront still updating** - Wait 15-20 minutes after deployment
2. **DNS not configured** - Ensure ALIAS/CNAME records are added
3. **Wrong origin** - Redeploy to fix S3 origin configuration
4. **Missing index.html** - Check S3 bucket: `aws s3 ls s3://bucketname/`
5. **Cache issues** - Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`

### Site Not Loading

- Check CloudFront distribution status (should be "Deployed")
- Verify DNS records point to CloudFront
- Test DNS resolution: `dig www.yourdomainname.com A`
- Clear browser cache or test in incognito mode
- Check CloudFront directly: `curl -I https://YOUR_DIST_ID.cloudfront.net/`

### Monitoring and Logs

- **CloudWatch Dashboard**: View metrics at `https://console.aws.amazon.com/cloudwatch/`
- **WAF Logs**: Check blocked requests in WAF console
- **CloudFront Logs**: Available in CloudWatch Logs
- **Google Analytics**: Real-time visitor data at analytics.google.com

### Security Headers

The application automatically adds:
- Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer Policy
- Permissions Policy