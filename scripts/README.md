# Scripts Directory

This directory contains all deployment and maintenance scripts for the NextJS AWS Template.

## Deployment Scripts

### Core Deployment

- **deploy-all-decoupled.sh** - Deploys all stacks in the correct order
- **deploy-app-content.sh** - Deploys application content to S3 and invalidates CloudFront cache

### Individual Stack Deployment

- **deploy-foundation.sh** - Deploys S3 buckets for website and logs
- **deploy-cert.sh** - Creates or imports SSL certificate (one-time setup)
- **deploy-edge-functions.sh** - Deploys CloudFront functions for redirects and security headers
- **deploy-waf.sh** - Deploys WAF security rules
- **deploy-cdn.sh** - Deploys CloudFront distribution with custom domains
- **deploy-monitoring.sh** - Sets up CloudWatch monitoring and alerts

## Maintenance Scripts

- **maintenance-mode.sh** - Enable/disable maintenance mode
  - `on` - Shows maintenance page
  - `off` - Restores normal site
  - `update "message" "eta"` - Updates maintenance message

## Status and Monitoring

- **check-stack-status.sh** - Monitors a single stack's status
- **check-all-stacks.sh** - Shows status of all stacks at once
- **diagnose-stack.sh** - Diagnoses issues with a specific stack

## Cleanup Scripts

- **destroy-waf.sh** - Removes WAF stack (with confirmation)
- **destroy-monitoring.sh** - Removes monitoring stack (with confirmation)

## Script Conventions

All scripts:

1. Load configuration from config.sh (which reads .env)
2. Use configurable stack names based on STACK_PREFIX
3. Check for AWS credentials before proceeding
4. Build CDK TypeScript if needed
5. Provide clear status messages
6. Exit with proper error codes
7. Support the decoupled architecture with proper dependencies

## Common Script Patterns

```bash
# All scripts follow this pattern:
1. Load configuration from config.sh
2. Check AWS credentials
3. Build CDK (if needed)
4. Execute CDK deployment with configurable stack names
5. Provide success/failure feedback
```

## Stack Dependencies

When deploying, ensure stacks are deployed in this order:

1. {STACK_PREFIX}-Foundation (required by CDN and App)
2. {STACK_PREFIX}-Certificate (required by CDN)
3. {STACK_PREFIX}-EdgeFunctions (required by CDN)
4. {STACK_PREFIX}-WAF (optional, used by CDN)
5. {STACK_PREFIX}-CDN (required by App)
6. {STACK_PREFIX}-App (deploys content)
7. {STACK_PREFIX}-Monitoring (optional, monitors CDN)

## Configuration

All scripts use the configuration from `config.sh` which reads environment variables:

- `APP_NAME`: Application name (e.g., "my-app")
- `DOMAIN_NAME`: Domain name (e.g., "myapp.com")
- `STACK_PREFIX`: AWS stack prefix (defaults to uppercase APP_NAME)

Stack names are generated as `{STACK_PREFIX}-{StackType}` (e.g., "MYAPP-Foundation").