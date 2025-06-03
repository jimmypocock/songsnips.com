import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export interface WafStackProps extends StackProps {}

export class WafStack extends Stack {
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    // Create IP rate-based rule
    const rateLimitRule: wafv2.CfnWebACL.RuleProperty = {
      name: 'RateLimitRule',
      priority: 1,
      action: {
        block: {}
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'RateLimitRule',
      },
      statement: {
        rateBasedStatement: {
          limit: 2000, // 2000 requests per 5 minutes per IP
          aggregateKeyType: 'IP',
        },
      },
    };

    // Create geo-blocking rule (optional - remove if not needed)
    const geoBlockRule: wafv2.CfnWebACL.RuleProperty = {
      name: 'GeoBlockRule',
      priority: 2,
      action: {
        allow: {}
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'GeoBlockRule',
      },
      statement: {
        notStatement: {
          statement: {
            geoMatchStatement: {
              // Block countries known for high bot traffic
              // Remove this rule if you want global access
              countryCodes: ['CN', 'RU', 'KP'], // China, Russia, North Korea
            },
          },
        },
      },
    };

    // AWS Managed Rules - Common Rule Set
    const awsManagedRulesCommonRuleSet: wafv2.CfnWebACL.RuleProperty = {
      name: 'AWS-AWSManagedRulesCommonRuleSet',
      priority: 3,
      overrideAction: {
        none: {}
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWS-AWSManagedRulesCommonRuleSet',
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesCommonRuleSet',
        },
      },
    };

    // AWS Managed Rules - Known Bad Inputs
    const awsManagedRulesKnownBadInputsRuleSet: wafv2.CfnWebACL.RuleProperty = {
      name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
      priority: 4,
      overrideAction: {
        none: {}
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
        },
      },
    };

    // Create Web ACL
    this.webAcl = new wafv2.CfnWebACL(this, 'AppWebAcl', {
      scope: 'CLOUDFRONT',
      defaultAction: {
        allow: {}
      },
      rules: [
        rateLimitRule,
        // geoBlockRule, // Uncomment if you want geo-blocking
        awsManagedRulesCommonRuleSet,
        awsManagedRulesKnownBadInputsRuleSet,
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: `${this.stackName}-WebAcl`,
      },
    });

    // Outputs
    new CfnOutput(this, 'WebAclArn', {
      value: this.webAcl.attrArn,
      description: 'WAF Web ACL ARN',
      exportName: `${this.stackName}-WebAclArn`,
    });

    new CfnOutput(this, 'WebAclId', {
      value: this.webAcl.attrId,
      description: 'WAF Web ACL ID',
      exportName: `${this.stackName}-WebAclId`,
    });
  }
}