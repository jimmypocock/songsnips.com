# CDK Stack Architecture (Implemented)

## Previous Issues with Tight Coupling (Resolved)

1. **Certificate trapped in main stack** - Can't delete while CloudFront uses it
2. **Lambda@Edge functions** - Global replication makes updates/deletes slow
3. **S3 + CloudFront coupling** - Can't update bucket independently
4. **Monitoring assumes distribution exists** - Creates dependency chain

## Current Stack Architecture

### 1. Foundation Stack (Deploy Once)
```
{STACK_PREFIX}-Foundation
├── S3 Bucket (content storage)
├── S3 Bucket (logs)
└── Outputs: BucketName, LogsBucketName
```

**Why separate**: S3 buckets are often the most stable part. Rarely need updates.

### 2. Certificate Stack (Deploy Once)
```
{STACK_PREFIX}-Certificate
├── ACM Certificate
└── Outputs: CertificateArn
```

**Why separate**: Certificates live for years, DNS validation is one-time.

### 3. Edge Functions Stack
```
{STACK_PREFIX}-EdgeFunctions
├── CloudFront Function (Redirects)
├── CloudFront Function (Security Headers)
└── Outputs: FunctionArns
```

**Why separate**: Edge functions replicate globally, updates are slow. Separate them to update independently.

### 4. CDN Stack (Main Application)
```
{STACK_PREFIX}-CDN
├── CloudFront Distribution
├── Origin Access Identity
└── Outputs: DistributionId, DomainName
```

**Dependencies**: Foundation, Certificate, Edge Functions
**Why separate**: Can update CDN config without touching content or functions.

### 5. WAF Stack
```
{STACK_PREFIX}-WAF
├── WAF WebACL
├── Rate Limiting Rules
├── Geo Blocking Rules
└── Outputs: WebACLArn
```

**Why separate**: Security rules change frequently, no need to touch app.

### 6. App Stack
```
{STACK_PREFIX}-App
├── Content Deployment
├── S3 Sync
├── CloudFront Invalidation
└── Outputs: DeploymentTimestamp
```

**Why separate**: Application deployments happen frequently without infrastructure changes.

### 7. Monitoring Stack
```
{STACK_PREFIX}-Monitoring
├── CloudWatch Dashboards
├── SNS Topics
├── Billing Alarms ($10, $50, $100)
├── Error Rate Alarms
├── Traffic Alarms
└── Outputs: SNSTopicArns, DashboardURLs
```

**Why separate**: Alert thresholds and notification settings change frequently.

## Benefits of This Architecture

### 1. Independent Updates
- Update WAF rules without touching the app
- Change alert thresholds without redeploying
- Modify edge functions separately from CDN

### 2. Faster Deployments
- Only deploy what changed
- Parallel stack deployments possible
- No waiting for global propagation unless needed

### 3. Safer Deletions
- Delete monitoring without affecting app
- Remove WAF without downtime
- Clear dependency order

### 4. Cost Optimization
- Delete expensive features (WAF) independently
- Keep core app running with minimal stacks

### 5. Team Collaboration
- Security team owns WAF stack
- DevOps owns monitoring stacks
- Frontend team owns CDN/content

## Implementation Status

1. **Completed** ✓
   - Foundation Stack (S3 buckets)
   - Certificate Stack (ACM certificate)
   - Edge Functions Stack (CloudFront functions)
   - WAF Stack (security rules)
   - CDN Stack (CloudFront distribution)
   - App Stack (content deployment)
   - Monitoring Stack (dashboards and alerts)

2. **Not Implemented**
   - DNS Stack (using external DNS provider)
   - Further stack splitting (current architecture is optimal)

## Deployment Order

```bash
# One-time setup
1. npm run deploy:foundation
2. npm run deploy:cert

# Core application  
3. npm run deploy:edge
4. npm run deploy:waf
5. npm run deploy:cdn
6. npm run deploy:app

# Optional monitoring
7. npm run deploy:monitoring -- -c notificationEmail=your@email.com
```

## Migration Complete

The migration from monolithic to decoupled architecture has been completed:

1. **Phase 1**: ✓ Deployed all new stacks
   - Foundation, Certificate, Edge Functions, WAF, CDN, App, Monitoring
   - All stacks are operational

2. **Phase 2**: ✓ Traffic switched
   - CloudFront distribution configured with custom domains
   - Certificate attached and SSL working
   - WAF protection active

3. **Phase 3**: Template Configuration
   - Configure APP_NAME, DOMAIN_NAME, and STACK_PREFIX in environment variables
   - Old legacy stacks can be cleaned up using the destroy scripts

## Example: Edge Functions Stack

```typescript
export class EdgeFunctionsStack extends Stack {
  public readonly redirectFunction: cloudfront.Function;
  public readonly securityHeadersFunction: cloudfront.Function;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.redirectFunction = new cloudfront.Function(this, 'RedirectFunction', {
      // ... function code
    });

    this.securityHeadersFunction = new cloudfront.Function(this, 'SecurityHeaders', {
      // ... function code
    });

    // Export for other stacks
    new CfnOutput(this, 'RedirectFunctionArn', {
      value: this.redirectFunction.functionArn,
      exportName: `${this.stackName}-RedirectFunctionArn`,
    });
  }
}
```

## Key Principles

1. **Stable Together, Volatile Separate**
   - Group resources that change at the same rate
   - Separate frequently updated from rarely updated

2. **Minimize Cross-Stack References**
   - Use exports/imports sparingly
   - Pass values through parameters when possible

3. **Consider Blast Radius**
   - Failed deployment should affect minimum resources
   - Critical resources in separate stacks

4. **Think About Teams**
   - Who updates what?
   - Separate by ownership/responsibility

5. **Plan for Failure**
   - What if a stack gets stuck?
   - Can you work around it?
   - Is the site still up?