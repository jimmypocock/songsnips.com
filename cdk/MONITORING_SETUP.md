# CloudFront Monitoring Setup Guide

## Overview
This enhanced monitoring setup provides comprehensive attack detection for your CloudFront distribution at ~$2/month (vs $30/month for WAF).

## Features
- 🚨 **Attack Pattern Detection**
  - High 4xx error rate (vulnerability scanning)
  - Traffic surges (DDoS attempts)
  - Bandwidth spikes (hotlinking/scraping)
  - Low cache hit rates (cache poisoning)
  
- 📊 **Cost Control**
  - Daily bandwidth usage alerts
  - Monthly cost estimation
  - Billing threshold alerts

- 📈 **Performance Monitoring**
  - Origin latency tracking
  - Cache performance metrics
  - Real-time traffic dashboard

## Setup Instructions

### 1. Deploy the Enhanced Monitoring Stack

```bash
cd cdk

# Option A: Update your existing app.ts to use the enhanced stack
# Change line 9 from:
# import { MonitoringStack } from './monitoring-stack';
# to:
# import { MonitoringStack } from './monitoring-stack-enhanced';

# Option B: Keep both and deploy separately
# Just deploy with a different stack name

# Deploy the stack
npm run build
cdk deploy SONGSNIPS-Monitoring --parameters notificationEmail=your-email@example.com
```

### 2. Configure Email Alerts

After deployment:
1. Check your email for SNS subscription confirmation
2. Click the confirmation link
3. You'll now receive alerts when thresholds are breached

### 3. View Your Dashboard

The CDK output will include a dashboard URL like:
```
SONGSNIPS-Monitoring.DashboardUrl = https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=songsnips-monitoring-metrics
```

## Alert Thresholds

| Alert | Threshold | What it means |
|-------|-----------|---------------|
| 4xx Error Pattern | >20% for 10 min | Possible vulnerability scanning |
| 404 Spike | >100 in 5 min | Directory traversal attempts |
| Traffic Surge | >10k requests/5 min | DDoS or bot attack |
| Bandwidth Spike | >10 GB/hour | Hotlinking or scraping |
| Daily Bandwidth | >3.3 GB/day | On track to exceed 100 GB/month |
| Cache Hit Rate | <80% | Performance issue or attack |
| Origin Latency | >1 second | S3 issues or origin attack |

## When You Get an Alert

### Quick Response:
1. Check the CloudWatch dashboard (link in CDK output)
2. Look for patterns in the graphs
3. If attack suspected, analyze logs:

```bash
# Run the log analyzer (after alert)
cd cdk
npx ts-node scripts/analyze-cloudfront-logs.ts \
  --bucket songsnips.com-logs \
  --prefix cloudfront/ \
  --hours 6
```

### What to Look For:
- **Multiple IPs with high 404s** → Scanner bot
- **Single IP with massive bandwidth** → Hotlinking
- **Requests for .php/.asp files** → WordPress scanner
- **../.. in URLs** → Directory traversal

### Emergency Actions:
1. **If under attack**: Re-enable WAF temporarily
   ```bash
   cdk deploy SONGSNIPS-WAF
   # Update CDN stack to use WAF
   ```

2. **Block specific IPs**: Use CloudFront security rules
3. **Invalidate cache**: If cache poisoning suspected

## Cost Breakdown

- CloudWatch Alarms: 9 × $0.10 = $0.90/month
- CloudWatch Dashboard: Free (first 3)
- Log Storage (1 week): ~$0.50/month
- SNS Notifications: ~$0.10/month
- **Total: ~$1.50/month**

## Customization

Edit `monitoring-stack-enhanced.ts` to adjust:
- `monthlyBandwidthGbThreshold`: Default 100 GB
- `enable4xxPatternDetection`: Default true
- Alert thresholds for your traffic patterns

## Log Analysis Script

The included `analyze-cloudfront-logs.ts` script provides:
- Top bandwidth consumers by IP
- Most requested URLs
- Error path analysis
- Suspicious pattern detection
- Geographic distribution (if needed)

Run after receiving alerts to investigate further.

## FAQ

**Q: When should I keep the WAF?**
A: Only if you're actively under attack or handling sensitive data/authentication.

**Q: Can I adjust alert sensitivity?**
A: Yes, modify the threshold values in the CDK stack.

**Q: How quickly will I be alerted?**
A: Most alerts trigger within 5-10 minutes of the condition.

**Q: What if I get too many false alerts?**
A: Adjust thresholds based on your normal traffic patterns after a week of data.