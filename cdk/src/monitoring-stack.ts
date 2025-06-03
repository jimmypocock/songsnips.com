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
}

export class MonitoringStack extends Stack {
  public readonly alertTopic: sns.Topic;
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

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

    // CloudWatch Log Group for application logs
    const logGroup = new logs.LogGroup(this, 'AppLogs', {
      logGroupName: `/aws/cloudfront/${this.stackName.toLowerCase()}`,
      retention: logs.RetentionDays.ONE_MONTH,
    });

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

    // Billing Alert - $50 threshold
    const billingAlarm50 = new cloudwatch.Alarm(this, 'BillingAlarm50', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD',
        },
        statistic: 'Maximum',
        period: Duration.hours(6),
      }),
      threshold: 50,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Alert when AWS charges exceed $50',
    });

    billingAlarm50.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // Billing Alert - $100 threshold (critical)
    const billingAlarm100 = new cloudwatch.Alarm(this, 'BillingAlarm100', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD',
        },
        statistic: 'Maximum',
        period: Duration.hours(6),
      }),
      threshold: 100,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'CRITICAL: AWS charges exceed $100',
    });

    billingAlarm100.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // CloudFront 4xx Error Rate Alarm
    const error4xxAlarm = new cloudwatch.Alarm(this, 'Error4xxAlarm', {
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
      threshold: 5, // Alert if 4xx error rate exceeds 5%
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'High 4xx error rate detected',
    });

    error4xxAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // CloudFront 5xx Error Rate Alarm
    const error5xxAlarm = new cloudwatch.Alarm(this, 'Error5xxAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: {
          DistributionId: props.distributionId,
          Region: 'Global',
        },
        statistic: 'Average',
        period: Duration.minutes(5),
      }),
      threshold: 1, // Alert if 5xx error rate exceeds 1%
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Server errors detected',
    });

    error5xxAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // Traffic Surge Alarm - Alert if requests exceed normal patterns
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
      alarmDescription: 'Traffic surge detected',
    });

    trafficSurgeAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(this.alertTopic)
    );

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'AppDashboard', {
      dashboardName: `${this.stackName.toLowerCase()}-metrics`,
    });

    // Add widgets to dashboard
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Request Count',
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
        title: 'Error Rates',
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
          }),
        ],
        width: 12,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Bytes Downloaded',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/CloudFront',
            metricName: 'BytesDownloaded',
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
        title: 'Origin Latency',
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
  }
}