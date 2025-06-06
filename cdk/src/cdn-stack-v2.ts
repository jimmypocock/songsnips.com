import { Stack, StackProps, CfnOutput, Duration, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface CdnStackV2Props extends StackProps {
  domainName: string;
  certificate?: acm.ICertificate;
  redirectFunction: cloudfront.IFunction;
  securityHeadersFunction: cloudfront.IFunction;
  webAclArn?: string;
  apiGatewayUrl?: string; // Optional API Gateway URL
}

export class CdnStackV2 extends Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CdnStackV2Props) {
    super(scope, id, props);

    // Import buckets from Foundation stack using fixed names
    const websiteBucket = s3.Bucket.fromBucketName(this, 'ImportedWebsiteBucket', `${props.domainName}-app`);
    const logsBucket = s3.Bucket.fromBucketName(this, 'ImportedLogsBucket', `${props.domainName}-logs`);

    // Response Headers Policy
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: `${this.stackName}-SecurityPolicy`,
      comment: `Security headers for ${this.stackName}`,
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { 
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true 
        },
        referrerPolicy: { 
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true 
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(63072000),
          includeSubdomains: true,
          preload: true,
          override: true
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true
        }
      },
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'permissions-policy',
            value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
            override: true
          },
          {
            header: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
            override: true
          }
        ]
      }
    });

    // Cache Policy for static assets
    const staticCachePolicy = new cloudfront.CachePolicy(this, 'StaticCachePolicy', {
      cachePolicyName: `${this.stackName}-StaticCachePolicy`,
      comment: `Cache policy for static assets ${this.stackName}`,
      defaultTtl: Duration.hours(24),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.days(365),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Cache Policy for API (no caching)
    const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
      cachePolicyName: `${this.stackName}-ApiCachePolicy`,
      comment: `Cache policy for API ${this.stackName}`,
      defaultTtl: Duration.seconds(0),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.seconds(0),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization', 'Content-Type'),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Create behaviors object
    const additionalBehaviors: Record<string, cloudfront.BehaviorOptions> = {};

    // Add API behavior if API Gateway URL is provided
    if (props.apiGatewayUrl) {
      // Parse the API Gateway URL to extract domain and path
      const apiUrl = new URL(props.apiGatewayUrl);
      const apiDomainName = apiUrl.hostname;
      const apiPath = apiUrl.pathname.endsWith('/') ? apiUrl.pathname.slice(0, -1) : apiUrl.pathname;

      const apiOrigin = new origins.HttpOrigin(apiDomainName, {
        originPath: apiPath,
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      });

      additionalBehaviors['/api/*'] = {
        origin: apiOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: apiCachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        compress: true,
      };
    }

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        functionAssociations: [
          {
            function: props.redirectFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
          {
            function: props.securityHeadersFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE,
          }
        ],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: staticCachePolicy,
        responseHeadersPolicy: responseHeadersPolicy,
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
      additionalBehaviors,
      domainNames: props.certificate ? [`www.${props.domainName}`, props.domainName] : undefined,
      certificate: props.certificate,
      defaultRootObject: 'index.html',
      webAclId: props.webAclArn,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      logBucket: logsBucket,
      logFilePrefix: 'cloudfront-logs/',
      enableLogging: true,
      comment: `${this.stackName} CDN Distribution`,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
      ],
    });

    // Outputs
    new CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: `${this.stackName}-DistributionId`,
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
      exportName: `${this.stackName}-DistributionDomainName`,
    });

    new CfnOutput(this, 'DistributionUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
    });

    if (props.certificate) {
      new CfnOutput(this, 'PrimaryDomainUrl', {
        value: `https://www.${props.domainName}`,
        description: 'Primary Domain URL',
      });
    }

    // Add bucket policy to allow CloudFront OAC access
    const bucketPolicyStatement = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipalReadOnly',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com'
          },
          Action: 's3:GetObject',
          Resource: `${websiteBucket.bucketArn}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`
            }
          }
        }
      ]
    };

    // Use AWS SDK to put the bucket policy
    new cr.AwsCustomResource(this, 'SetBucketPolicy', {
      onCreate: {
        service: 'S3',
        action: 'putBucketPolicy',
        parameters: {
          Bucket: websiteBucket.bucketName,
          Policy: JSON.stringify(bucketPolicyStatement)
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${websiteBucket.bucketName}-policy`)
      },
      onUpdate: {
        service: 'S3',
        action: 'putBucketPolicy',
        parameters: {
          Bucket: websiteBucket.bucketName,
          Policy: JSON.stringify(bucketPolicyStatement)
        }
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['s3:PutBucketPolicy', 's3:GetBucketPolicy'],
          resources: [websiteBucket.bucketArn]
        })
      ])
    });
  }
}