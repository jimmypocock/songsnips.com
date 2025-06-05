import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path';

export interface ApiStackProps extends StackProps {
  domainName: string;
  alertEmail?: string;
}

export class ApiStack extends Stack {
  public readonly api: apigateway.RestApi;
  public readonly quotaTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Secrets Manager secret for YouTube API key
    const youtubeApiKeySecret = new secretsmanager.Secret(this, 'YouTubeApiKey', {
      description: 'YouTube Data API v3 key for search functionality',
      secretName: `${props.domainName}-youtube-api-key`,
    });

    // DynamoDB table for quota tracking and search cache
    this.quotaTable = new dynamodb.Table(this, 'QuotaTable', {
      tableName: `${props.domainName}-youtube-search`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
      pointInTimeRecovery: false,
    });

    // Lambda layer for shared dependencies
    const dependenciesLayer = new lambda.LayerVersion(this, 'DependenciesLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-layers/dependencies')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'YouTube search API dependencies',
    });

    // Lambda function for search
    const searchFunction = new lambda.Function(this, 'SearchFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'search.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/search')),
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        QUOTA_TABLE_NAME: this.quotaTable.tableName,
        YOUTUBE_API_KEY_SECRET_NAME: youtubeApiKeySecret.secretName,
        DAILY_QUOTA_LIMIT: '10000',
        SEARCH_QUOTA_COST: '100',
      },
      layers: [dependenciesLayer],
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Lambda function for quota status
    const quotaStatusFunction = new lambda.Function(this, 'QuotaStatusFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'quota-status.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/quota-status')),
      timeout: Duration.seconds(5),
      memorySize: 128,
      environment: {
        QUOTA_TABLE_NAME: this.quotaTable.tableName,
        DAILY_QUOTA_LIMIT: '10000',
        SEARCH_QUOTA_COST: '100',
      },
      layers: [dependenciesLayer],
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant permissions
    this.quotaTable.grantReadWriteData(searchFunction);
    this.quotaTable.grantReadData(quotaStatusFunction);
    youtubeApiKeySecret.grantRead(searchFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'YouTubeSearchApi', {
      restApiName: `${props.domainName}-youtube-search`,
      description: 'YouTube search API with quota management',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
        dataTraceEnabled: false,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [
          `https://${props.domainName}`,
          `https://www.${props.domainName}`,
          'http://localhost:3000', // For local development
        ],
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        maxAge: Duration.hours(1),
      },
    });

    // API resources
    const apiResource = this.api.root.addResource('api');
    const searchResource = apiResource.addResource('search');
    const statusResource = searchResource.addResource('status');

    // Search endpoint
    searchResource.addMethod('GET', new apigateway.LambdaIntegration(searchFunction, {
      requestTemplates: {
        'application/json': JSON.stringify({
          q: "$input.params('q')",
          maxResults: "$input.params('maxResults')",
          type: "$input.params('type')",
        }),
      },
    }), {
      requestParameters: {
        'method.request.querystring.q': true,
        'method.request.querystring.maxResults': false,
        'method.request.querystring.type': false,
      },
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }],
    });

    // Quota status endpoint
    statusResource.addMethod('GET', new apigateway.LambdaIntegration(quotaStatusFunction), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }],
    });

    // CloudWatch Alarms
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      displayName: 'YouTube Search API Alerts',
    });

    if (props.alertEmail) {
      alertTopic.addSubscription(new snsSubscriptions.EmailSubscription(props.alertEmail));
    }

    // Quota usage alarm (80% threshold)
    const quotaUsageMetric = new cloudwatch.Metric({
      namespace: 'YouTubeSearchAPI',
      metricName: 'QuotaUsagePercentage',
      dimensionsMap: {
        Environment: 'Production',
      },
    });

    new cloudwatch.Alarm(this, 'HighQuotaUsageAlarm', {
      metric: quotaUsageMetric,
      threshold: 80,
      evaluationPeriods: 1,
      alarmDescription: 'YouTube API quota usage exceeded 80%',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));

    // Lambda error alarm
    new cloudwatch.Alarm(this, 'SearchFunctionErrorAlarm', {
      metric: searchFunction.metricErrors({
        period: Duration.minutes(5),
      }),
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'Search function errors exceeded threshold',
    }).addAlarmAction(new cloudwatchActions.SnsAction(alertTopic));

    // Outputs
    new CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: `${this.stackName}-ApiUrl`,
    });

    new CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: `${this.stackName}-ApiId`,
    });

    new CfnOutput(this, 'QuotaTableName', {
      value: this.quotaTable.tableName,
      description: 'DynamoDB table name for quota tracking',
      exportName: `${this.stackName}-QuotaTableName`,
    });

    new CfnOutput(this, 'YouTubeApiKeySecretArn', {
      value: youtubeApiKeySecret.secretArn,
      description: 'ARN of the YouTube API key secret',
      exportName: `${this.stackName}-YouTubeApiKeySecretArn`,
    });
  }
}