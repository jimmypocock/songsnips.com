# CloudFront Monitoring Stack Guide

This guide explains how to use the enhanced CloudFront monitoring stack for cost-effective monitoring and alerting.

## Features

### 1. **Cost Control Alarms**
- **Billing Alerts**: $10, $50, and $100 thresholds
- **Bandwidth Monitoring**: Daily bandwidth usage alerts to prevent unexpected costs
- **Request Rate Monitoring**: Alerts for traffic spikes that could increase costs

### 2. **Performance Monitoring**
- **Cache Hit Rate**: Alerts when cache performance drops below 80%
- **Origin Latency**: Monitors backend response times
- **Error Rates**: 4xx (>5%) and 5xx (>1%) error monitoring

### 3. **Enhanced Dashboard**
- Traffic patterns and request counts
- Bandwidth usage in GB with cost estimates
- Cache performance metrics
- Real-time error rate tracking

### 4. **Cost-Effective Settings**
- CloudWatch Logs retention: 7 days (reduced from 30 days)
- Efficient metric periods to minimize API calls
- Consolidated dashboard with inherited periods

## Setup Instructions

### Option 1: Replace Existing Monitoring Stack

1. Update your `app.ts` to use the enhanced monitoring stack:

```typescript
import { MonitoringStack } from './monitoring-stack-enhanced';

// ... other imports and setup ...

// 6. Enhanced Monitoring Stack
const monitoringStack = new MonitoringStack(app, `${stackPrefix}-Monitoring`, {
  distributionId: cdnStack.distribution.distributionId,
  domainName: domainName,
  emailAddress: notificationEmail,
  monthlyBandwidthGBThreshold: 100, // Adjust based on your needs
  requestsPerMinuteThreshold: 1000, // Adjust based on expected traffic
  env: usEast1Env,
  description: `Enhanced monitoring and alerting for ${appName}`,
});
```

### Option 2: Deploy as Additional Stack

To keep your existing monitoring and add enhanced features:

```typescript
// Keep existing monitoring
const monitoringStack = new MonitoringStack(app, `${stackPrefix}-Monitoring`, {
  distributionId: cdnStack.distribution.distributionId,
  emailAddress: notificationEmail,
  env: usEast1Env,
  description: `Monitoring and alerting for ${appName}`,
});

// Add enhanced monitoring
const enhancedMonitoringStack = new MonitoringStack(app, `${stackPrefix}-Monitoring-Enhanced`, {
  distributionId: cdnStack.distribution.distributionId,
  domainName: domainName,
  emailAddress: notificationEmail,
  monthlyBandwidthGBThreshold: 100,
  requestsPerMinuteThreshold: 1000,
  env: usEast1Env,
  description: `Enhanced monitoring for ${appName}`,
});

enhancedMonitoringStack.addDependency(cdnStack);
```

## Configuration Options

### Bandwidth Threshold
```typescript
monthlyBandwidthGBThreshold: 100, // Alert if daily average exceeds 100GB/month pace
```

CloudFront pricing (approximate):
- First 10TB/month: $0.085/GB
- Next 40TB/month: $0.080/GB

Example: 100GB/month ≈ $8.50/month in bandwidth costs

### Request Rate Threshold
```typescript
requestsPerMinuteThreshold: 1000, // Alert if exceeds 1000 requests/minute
```

CloudFront pricing: $0.0075 per 10,000 HTTPS requests
Example: 1000 req/min = 43.2M requests/month ≈ $3.24/month

## Deployment

```bash
# Deploy the monitoring stack
npm run cdk deploy SONGSNIPS-Monitoring

# Or deploy all stacks
npm run cdk deploy --all
```

## Cost Optimization Tips

1. **Adjust Thresholds**: Set bandwidth and request thresholds based on your expected usage
2. **Log Retention**: The stack uses 7-day retention for logs (vs 30 days) to reduce costs
3. **Dashboard Usage**: CloudWatch dashboards are free for the first 3 dashboards
4. **Alarm Costs**: First 10 alarms are free, then $0.10/alarm/month

## Analyzing CloudFront Logs

The stack enables CloudFront logging to S3. To analyze logs:

1. **AWS Console**: Use CloudWatch Insights with the provided queries
2. **Athena**: Query S3 logs directly for detailed analysis
3. **Cost Explorer**: Monitor CloudFront costs by service

### Sample Log Insights Queries

The enhanced monitoring stack includes references to useful queries:
- Top 404 URLs
- High bandwidth consumers by IP
- Geographic distribution
- User agent analysis

Access these through CloudWatch Logs Insights on your CloudFront log group.

## Alerts and Notifications

When an alarm triggers, you'll receive:
1. Email notification (if configured)
2. Details about the metric that triggered
3. Link to CloudWatch dashboard for investigation

## Monthly Cost Estimate

For a typical small application:
- CloudWatch Alarms: ~$1/month (10+ alarms)
- CloudWatch Logs: ~$0.50/month (7-day retention)
- SNS Notifications: ~$0.01/month
- **Total: ~$1.50-2.00/month**

## Troubleshooting

### Not Receiving Alerts
1. Check SNS subscription confirmation email
2. Verify email address in CDK context
3. Check CloudWatch Alarm history

### High Bandwidth Alerts
1. Check CloudFront cache hit rate
2. Review large file requests in logs
3. Consider adding CloudFront cache behaviors

### High Error Rates
1. Check origin server health
2. Review CloudFront error pages
3. Analyze access patterns in logs