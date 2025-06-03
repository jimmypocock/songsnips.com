import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface EdgeFunctionsStackProps extends StackProps {
  domainName: string;
}

export class EdgeFunctionsStack extends Stack {
  public readonly redirectFunction: cloudfront.Function;
  public readonly securityHeadersFunction: cloudfront.Function;

  constructor(scope: Construct, id: string, props: EdgeFunctionsStackProps) {
    super(scope, id, props);

    // Lambda@Edge function for redirects and static route handling
    this.redirectFunction = new cloudfront.Function(this, 'RedirectFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var headers = request.headers;
          var host = headers.host.value;
          var uri = request.uri;
          
          // Redirect CloudFront URL to www domain
          if (host.includes('cloudfront.net')) {
            var response = {
              statusCode: 301,
              statusDescription: 'Moved Permanently',
              headers: {
                location: { value: 'https://www.${props.domainName}' + uri }
              }
            };
            return response;
          }
          
          // Redirect non-www to www
          if (host === '${props.domainName}') {
            var response = {
              statusCode: 301,
              statusDescription: 'Moved Permanently',
              headers: {
                location: { value: 'https://www.${props.domainName}' + uri }
              }
            };
            return response;
          }
          
          // Handle static export routing for Next.js
          // If URI doesn't have a file extension and isn't root, try .html
          if (uri !== '/' && !uri.includes('.') && !uri.endsWith('/')) {
            request.uri = uri + '.html';
          }
          // If URI ends with '/', append index.html
          else if (uri.endsWith('/') && uri !== '/') {
            request.uri = uri + 'index.html';
          }
          
          return request;
        }
      `),
      comment: `Handles redirects and static route mapping for ${this.stackName}`,
    });

    // Security Headers Function
    this.securityHeadersFunction = new cloudfront.Function(this, 'SecurityHeadersFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var response = event.response;
          var headers = response.headers;
          
          // Security headers
          headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload' };
          headers['x-content-type-options'] = { value: 'nosniff' };
          headers['x-frame-options'] = { value: 'DENY' };
          headers['x-xss-protection'] = { value: '1; mode=block' };
          headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };
          headers['permissions-policy'] = { value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()' };
          headers['content-security-policy'] = { 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.googletagmanager.com https://*.googlesyndication.com https://*.googleadservices.com https://*.google-analytics.com https://*.doubleclick.net https://adservice.google.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com; img-src 'self' data: https: blob: *.google.com *.googleusercontent.com *.googlesyndication.com *.doubleclick.net *.gstatic.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.google.com https://*.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.googlesyndication.com https://*.googleadservices.com https://*.adtrafficquality.google; frame-src 'self' blob: data: https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google; fenced-frame-src * blob: data:; frame-ancestors 'none';" 
          };
          
          return response;
        }
      `),
      comment: 'Adds security headers to responses',
    });

    // Default Document Function (handles subdirectory index.html)
    const defaultDocumentFunction = new cloudfront.Function(this, 'DefaultDocumentFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
          
          // Check if URI ends with '/'
          if (uri.endsWith('/')) {
            request.uri += 'index.html';
          }
          
          // Check if URI is a directory (no file extension)
          else if (!uri.includes('.')) {
            request.uri += '/index.html';
          }
          
          return request;
        }
      `),
      comment: 'Handles default document for subdirectories',
    });

    // Outputs
    new CfnOutput(this, 'RedirectFunctionArn', {
      value: this.redirectFunction.functionArn,
      description: 'Redirect Function ARN',
      exportName: `${this.stackName}-RedirectFunctionArn`,
    });

    new CfnOutput(this, 'SecurityHeadersFunctionArn', {
      value: this.securityHeadersFunction.functionArn,
      description: 'Security Headers Function ARN',
      exportName: `${this.stackName}-SecurityHeadersFunctionArn`,
    });
  }
}