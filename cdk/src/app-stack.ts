import { Stack, StackProps, CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';
import * as fs from 'fs';

export interface AppStackProps extends StackProps {
  websiteBucketName: string;
  cdnStackName: string;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Import bucket from name
    const websiteBucket = s3.Bucket.fromBucketName(this, 'ImportedWebsiteBucket', props.websiteBucketName);

    // Import distribution from CloudFormation exports
    const distributionId = Fn.importValue(`${props.cdnStackName}-DistributionId`);
    const distributionDomainName = Fn.importValue(`${props.cdnStackName}-DistributionDomainName`);
    
    const distribution = cloudfront.Distribution.fromDistributionAttributes(this, 'ImportedDistribution', {
      distributionId: distributionId,
      domainName: distributionDomainName,
    });

    // Deploy site contents to S3
    // Path from CDK app root (cdk/) to the Next.js out directory
    const cdkRoot = path.join(__dirname, '..');
    const projectRoot = path.join(cdkRoot, '..');
    const nextBuildPath = path.join(projectRoot, 'out');
    const isNextJSBuild = fs.existsSync(nextBuildPath);
    
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: isNextJSBuild 
        ? [s3deploy.Source.asset(nextBuildPath)]      // NextJS static export
        : [s3deploy.Source.asset(projectRoot, {       // Original index.html
            exclude: ['*', '!index.html'],
          })],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
      cacheControl: [
        s3deploy.CacheControl.fromString('max-age=31536000,public,immutable'),
      ],
      prune: true,
      retainOnDelete: false,
    });

    // Outputs
    new CfnOutput(this, 'DeploymentComplete', {
      value: 'Application deployed successfully',
      description: 'Deployment status',
    });

    new CfnOutput(this, 'DeploymentTimestamp', {
      value: new Date().toISOString(),
      description: 'When this deployment occurred',
    });

    // If available, include git commit info
    const gitCommit = process.env.GITHUB_SHA || process.env.GIT_COMMIT || 'local';
    new CfnOutput(this, 'DeploymentVersion', {
      value: gitCommit.substring(0, 8),
      description: 'Git commit or version',
    });
  }
}