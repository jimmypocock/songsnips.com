import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';

export interface FoundationStackProps extends StackProps {
  domainName: string;
}

export class FoundationStack extends Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly logsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FoundationStackProps) {
    super(scope, id, props);

    // S3 bucket for CloudFront logs
    this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName: `${props.domainName}-logs`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          enabled: true,
          expiration: Duration.days(30),
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // S3 bucket for hosting static website
    this.websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${props.domainName}-app`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: Duration.days(7),
        },
      ],
    });

    // Outputs
    new CfnOutput(this, 'WebsiteBucketName', {
      value: this.websiteBucket.bucketName,
      description: 'Website S3 Bucket Name',
      exportName: `${this.stackName}-WebsiteBucketName`,
    });

    new CfnOutput(this, 'WebsiteBucketArn', {
      value: this.websiteBucket.bucketArn,
      description: 'Website S3 Bucket ARN',
      exportName: `${this.stackName}-WebsiteBucketArn`,
    });

    new CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      description: 'Logs S3 Bucket Name',
      exportName: `${this.stackName}-LogsBucketName`,
    });

    new CfnOutput(this, 'LogsBucketArn', {
      value: this.logsBucket.bucketArn,
      description: 'Logs S3 Bucket ARN',
      exportName: `${this.stackName}-LogsBucketArn`,
    });
  }
}