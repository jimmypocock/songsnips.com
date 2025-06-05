import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface CertificateStackProps extends StackProps {
  domainName: string;
  certificateArn?: string;
  createCertificate?: boolean;
}

export class CertificateStack extends Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    if (props.certificateArn) {
      // Import existing certificate - DO NOT manage it
      this.certificate = acm.Certificate.fromCertificateArn(
        this,
        'Certificate',  // Use the same logical ID as the created certificate
        props.certificateArn
      );
    } else {
      // Create new certificate (only if one doesn't exist)
      this.certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        subjectAlternativeNames: [`www.${props.domainName}`],
        validation: acm.CertificateValidation.fromDns(),
      });
    }
    
    // Always output the certificate ARN with consistent output names
    new CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'Certificate ARN',
      exportName: `${this.stackName}-CertificateArn`,
    });
    
    new CfnOutput(this, 'CertificateArnForReuse', {
      value: this.certificate.certificateArn,
      description: 'Save this ARN to prevent recreating the certificate',
    });
  }
}