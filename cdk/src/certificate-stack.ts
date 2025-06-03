import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface CertificateStackProps extends StackProps {
  domainName: string;
  certificateArn?: string;
  createCertificate?: boolean;
}

export class CertificateStack extends Stack {
  public readonly certificate: acm.ICertificate | undefined;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    if (props.certificateArn) {
      // Import existing certificate - DO NOT manage it
      this.certificate = acm.Certificate.fromCertificateArn(
        this,
        'ImportedCertificate',
        props.certificateArn
      );
      
      new CfnOutput(this, 'ImportedCertificateArn', {
        value: this.certificate.certificateArn,
        description: 'Imported Certificate ARN',
        exportName: `${this.stackName}-CertificateArn`,
      });
    } else if (props.createCertificate) {
      // Create new certificate
      this.certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        subjectAlternativeNames: [`www.${props.domainName}`],
        validation: acm.CertificateValidation.fromDns(),
      });
      
      new CfnOutput(this, 'NewCertificateArn', {
        value: this.certificate.certificateArn,
        description: 'Certificate ARN - Save this for future deployments',
        exportName: `${this.stackName}-CertificateArn`,
      });
      
      new CfnOutput(this, 'CertificateArnForReuse', {
        value: this.certificate.certificateArn,
        description: 'IMPORTANT: Add this to cdk.json as "certificateArn" to avoid recreating the certificate',
      });
    }
  }
}