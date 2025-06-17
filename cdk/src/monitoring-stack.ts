import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export interface MonitoringStackProps extends StackProps {
  distributionId: string;
  emailAddress?: string;
  // New options for enhanced monitoring
  monthlyBandwidthGbThreshold?: number; // Default: 100 GB
  enable4xxPatternDetection?: boolean;   // Default: true
}

export class MonitoringStack extends Stack {
  public readonly alertTopic: sns.Topic;
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const monthlyBandwidthGbThreshold = props.monthlyBandwidthGbThreshold ?? 100;
    const enable4xxPatternDetection = props.enable4xxPatternDetection ?? true;

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AppAlerts', {
      displayName: `${this.stackName} Alerts`,
    });

    // Add email subscription if provided
    if (props.emailAddress) {
      this.alertTopic.addSubscription(
        new subscriptions.EmailSubscription(props.emailAddress)
      );
    }

    // CloudWatch Log Group for application logs (reduced retention for cost savings)
    const logGroup = new logs.LogGroup(this, 'AppLogs', {
      logGroupName: `/aws/cloudfront/${this.stackName.toLowerCase()}`,
      retention: logs.RetentionDays.ONE_WEEK, // Reduced from ONE_MONTH
    });

    // === ATTACK PATTERN DETECTION ALARMS ===

    // 1. 4xx Error Pattern Detection - High rate suggests probing/scanning
    if (enable4xxPatternDetection) {
      const error4xxPatternAlarm = new cloudwatch.Alarm(this, 'Error4xxPatternAlarm', {
        metric: new cloudwatch.Metric({
          namespace: 'AWS/CloudFront',
          metricName: '4xxErrorRate',
          dimensionsMap: {
            DistributionId: props.distributionId,
            Region: 'Global',
          },
          statistic: 'Average',
          period: Duration.minutes(5),
        }),
        threshold: 20, // Alert if 4xx error rate exceeds 20%
        evaluationPeriods: 2, // Must breach for 10 minutes
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        alarmDescription: 'Potential vulnerability scanning detected - high 4xx rate',
      });

      error4xxPatternAlarm.addAlarmAction(
        new cloudwatch_actions.SnsAction(this.alertTopic)
      );

      // 404 Spike Detection - Many 404s in short time = directory traversal attempt
      const error404SpikeAlarm = new cloudwatch.Alarm(this, 'Error404SpikeAlarm', {
        metric: new cloudwatch.Metric({
          namespace: 'AWS/CloudFront',
          metricName: '4xxErrorCount',
          dimensionsMap: {
            DistributionId: props.distributionId,
            Region: 'Global',
          },
          statistic: 'Sum',
          period: Duration.minutes(5),
        }),
        threshold: 100, // Alert if more than 100 404s in 5 minutes
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        alarmDescription: 'Potential directory traversal attack - many 404 errors',
      });

      error404SpikeAlarm.addAlarmAction(
        new cloudwatch_actions.SnsAction(this.alertTopic)
      );
    }

    // 2. Traffic Surge Detection - DDoS or bot attack
    const trafficSurgeAlarm = new cloudwatch.Alarm(this, 'TrafficSurgeAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'Requests',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Sum',
        period: Duration.minutes(5),
      }),
      threshold: 10000, // Alert if more than 10k requests in 5 minutes
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Traffic surge detected - possible DDoS attack',
    });

    trafficSurgeAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // 3. Bandwidth Spike Detection - Hotlinking or content scraping
    const bandwidthSpikeAlarm = new cloudwatch.Alarm(this, 'BandwidthSpikeAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'BytesDownloaded',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Sum',
        period: Duration.hours(1),
      }),
      threshold: 10 * 1024 * 1024 * 1024, // 10 GB in 1 hour
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'High bandwidth usage - possible hotlinking or scraping',
    });

    bandwidthSpikeAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // 4. Monthly Bandwidth Threshold - Cost control
    const monthlyBandwidthAlarm = new cloudwatch.Alarm(this, 'MonthlyBandwidthAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'BytesDownloaded',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Sum',
        period: Duration.days(1), // Daily sum
      }),
      threshold: (monthlyBandwidthGbThreshold / 30) * 1024 * 1024 * 1024, // Daily threshold
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `Daily bandwidth exceeds ${Math.round(monthlyBandwidthGbThreshold / 30)} GB (monthly target: ${monthlyBandwidthGbThreshold} GB)`,
    });

    monthlyBandwidthAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // 5. Origin Latency - S3 performance issues or attack on origin
    const originLatencyAlarm = new cloudwatch.Alarm(this, 'OriginLatencyAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'OriginLatency',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Average',
        period: Duration.minutes(5),
      }),
      threshold: 1000, // 1 second latency
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'High origin latency - possible S3 issues or origin attack',
    });

    originLatencyAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // 6. Cache Hit Rate - Low hit rate might indicate cache poisoning attempts
    const cacheHitRateAlarm = new cloudwatch.Alarm(this, 'CacheHitRateAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'CacheHitRate',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Average',
        period: Duration.minutes(15),
      }),
      threshold: 80, // Alert if cache hit rate drops below 80%
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Low cache hit rate - possible cache poisoning or misconfiguration',
    });

    cacheHitRateAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // === EXISTING ALARMS (BILLING) ===
    
    // Billing Alert - $10 threshold
    const billingAlarm10 = new cloudwatch.Alarm(this, 'BillingAlarm10', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD',
        },
        statistic: 'Maximum',
        period: Duration.hours(6),
      }),
      threshold: 10,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Alert when AWS charges exceed $10',
    });

    billingAlarm10.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // === ENHANCED DASHBOARD ===
    
    this.dashboard = new cloudwatch.Dashboard(this, 'AppDashboard', {
      dashboardName: `${this.stackName.toLowerCase()}-metrics`,
    });

    // Row 1: Traffic Overview
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Request Count & Pattern',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: 'Requests',
            dimensionsMap: {
              DistributionId: props.distributionId,
              Region: 'Global',
            },
            statistic: 'Sum',
            period: Duration.minutes(5),
          }),
        ],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Error Rates (4xx/5xx)',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: '4xxErrorRate',
            dimensionsMap: {
              DistributionId: props.distributionId,
              Region: 'Global',
            },
            statistic: 'Average',
            period: Duration.minutes(5),
            color: cloudwatch.Color.ORANGE,
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: '5xxErrorRate',
            dimensionsMap: {
              DistributionId: props.distributionId,
              Region: 'Global',
            },
            statistic: 'Average',
            period: Duration.minutes(5),
            color: cloudwatch.Color.RED,
          }),
        ],
        leftAnnotations: [
          { value: 20, label: '4xx Alert Threshold', color: cloudwatch.Color.ORANGE },
          { value: 1, label: '5xx Alert Threshold', color: cloudwatch.Color.RED },
        ],
        width: 12,
      })
    );

    // Row 2: Bandwidth & Performance
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Bandwidth Usage (GB)',
        left: [
          new cloudwatch.MathExpression({
            expression: 'm1 / 1024 / 1024 / 1024',
            label: 'Bandwidth (GB)',
            usingMetrics: {
              m1: new cloudwatch.Metric({
                namespace: 'AWS/CloudFront',
                metricName: 'BytesDownloaded',
                dimensionsMap: {
                  DistributionId: props.distributionId,
                  Region: 'Global',
                },
                statistic: 'Sum',
                period: Duration.hours(1),
              }),
            },
          }),
        ],
        leftAnnotations: [
          { value: 10, label: 'Hourly Alert (10GB)', color: cloudwatch.Color.RED },
        ],
        leftYAxis: {
          label: 'GB',
          showUnits: false,
        },
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Cache Performance',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: 'CacheHitRate',
            dimensionsMap: {
              DistributionId: props.distributionId,
              Region: 'Global',
            },
            statistic: 'Average',
            period: Duration.minutes(5),
            color: cloudwatch.Color.GREEN,
          }),
        ],
        leftAnnotations: [
          { value: 80, label: 'Min Acceptable', color: cloudwatch.Color.ORANGE },
        ],
        leftYAxis: {
          min: 0,
          max: 100,
        },
        width: 12,
      })
    );

    // Row 3: Origin Health & Cost
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Origin Latency (ms)',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: 'OriginLatency',
            dimensionsMap: {
              DistributionId: props.distributionId,
              Region: 'Global',
            },
            statistic: 'Average',
            period: Duration.minutes(5),
          }),
        ],
        leftAnnotations: [
          { value: 1000, label: 'Alert Threshold (1s)', color: cloudwatch.Color.RED },
        ],
        width: 12,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Estimated Monthly Cost',
        metrics: [
          new cloudwatch.MathExpression({
            expression: '(m1 / 1024 / 1024 / 1024) * 0.085 * 30 / PERIOD(m1) * 86400',
            label: 'Est. Monthly Cost ($)',
            usingMetrics: {
              m1: new cloudwatch.Metric({
                namespace: 'AWS/CloudFront',
                metricName: 'BytesDownloaded',
                dimensionsMap: {
                  DistributionId: props.distributionId,
                  Region: 'Global',
                },
                statistic: 'Sum',
                period: Duration.days(1),
              }),
            },
          }),
        ],
        width: 12,
      })
    );

    // Outputs
    new CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS Alert Topic ARN',
      exportName: `${this.stackName}-AlertTopicArn`,
    });

    new CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });

    new CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group for CloudFront logs',
    });
  }
}