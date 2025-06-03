#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  stackName: string;
  status: 'pass' | 'fail';
  message?: string;
  errors?: string[];
}

async function validateStack(stackName: string): Promise<ValidationResult> {
  try {
    // Run CDK synth for the specific stack
    const { stdout, stderr } = await execAsync(
      `npx cdk synth ${stackName} --quiet --app "npx ts-node --prefer-ts-exts src/app.ts"`,
      { cwd: path.join(__dirname, '..') }
    );

    // Check for errors in stderr
    if (stderr && stderr.trim()) {
      // Check if it's just a warning
      if (stderr.includes('[Warning') || stderr.includes('ack:')) {
        return {
          stackName,
          status: 'pass',
          message: 'Stack validated with warnings',
          errors: [stderr.trim()]
        };
      }
      return {
        stackName,
        status: 'fail',
        message: 'Stack synthesis failed',
        errors: [stderr.trim()]
      };
    }

    return {
      stackName,
      status: 'pass',
      message: 'Stack validated successfully'
    };
  } catch (error: any) {
    return {
      stackName,
      status: 'fail',
      message: 'Stack validation error',
      errors: [error.message || 'Unknown error']
    };
  }
}

async function checkCircularDependencies(): Promise<ValidationResult> {
  try {
    // Run CDK synth for all stacks
    const { stdout, stderr } = await execAsync(
      'npx cdk synth --quiet --app "npx ts-node --prefer-ts-exts src/app.ts"',
      { cwd: path.join(__dirname, '..') }
    );

    // Check for circular dependency errors
    if (stderr && stderr.includes('cyclic reference')) {
      const errorLines = stderr.split('\n').filter(line => 
        line.includes('cyclic') || line.includes('depends on')
      );
      
      return {
        stackName: 'All Stacks',
        status: 'fail',
        message: 'Circular dependency detected',
        errors: errorLines
      };
    }

    return {
      stackName: 'All Stacks',
      status: 'pass',
      message: 'No circular dependencies found'
    };
  } catch (error: any) {
    // Parse error message for circular dependency info
    if (error.message && error.message.includes('cyclic reference')) {
      return {
        stackName: 'All Stacks',
        status: 'fail',
        message: 'Circular dependency detected',
        errors: [error.message]
      };
    }
    
    return {
      stackName: 'All Stacks',
      status: 'fail',
      message: 'Dependency check error',
      errors: [error.message || 'Unknown error']
    };
  }
}

async function validateContext(): Promise<ValidationResult> {
  try {
    const cdkJsonPath = path.join(__dirname, '..', 'cdk.json');
    const cdkJson = JSON.parse(fs.readFileSync(cdkJsonPath, 'utf8'));
    const context = cdkJson.context || {};
    
    const warnings: string[] = [];
    
    // Check for required context values
    if (!context.certificateArn && context.createCertificate !== 'true') {
      warnings.push('Neither certificateArn nor createCertificate=true is set. Certificate stack may fail.');
    }
    
    if (!context.notificationEmail) {
      warnings.push('notificationEmail not set. Monitoring alerts will not be configured.');
    }
    
    return {
      stackName: 'Context',
      status: warnings.length > 0 ? 'fail' : 'pass',
      message: warnings.length > 0 ? 'Context validation warnings' : 'Context validated successfully',
      errors: warnings
    };
  } catch (error: any) {
    return {
      stackName: 'Context',
      status: 'fail',
      message: 'Context validation error',
      errors: [error.message || 'Unknown error']
    };
  }
}

async function main() {
  console.log('🔍 Validating CDK Stacks...\n');
  
  const stacks = [
    'VTT-Foundation',
    'VTT-Certificate',
    'VTT-EdgeFunctions',
    'VTT-WAF',
    'VTT-CDN',
    'VTT-Monitoring',
    'VTT-App'
  ];
  
  const results: ValidationResult[] = [];
  
  // Check context first
  console.log('Checking CDK context...');
  const contextResult = await validateContext();
  results.push(contextResult);
  
  // Check for circular dependencies
  console.log('Checking for circular dependencies...');
  const depResult = await checkCircularDependencies();
  results.push(depResult);
  
  // Validate individual stacks
  for (const stack of stacks) {
    console.log(`Validating ${stack}...`);
    const result = await validateStack(stack);
    results.push(result);
  }
  
  // Display results
  console.log('\n📊 Validation Results:\n');
  
  let hasErrors = false;
  
  for (const result of results) {
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    const isWarning = result.message?.includes('warning');
    console.log(`${statusIcon} ${result.stackName}: ${result.message}`);
    
    if (result.errors && result.errors.length > 0) {
      if (result.status === 'fail' && !isWarning) {
        hasErrors = true;
      }
      result.errors.forEach(error => {
        const prefix = isWarning ? '   ⚠️ ' : '   └─ ';
        console.log(`${prefix}${error}`);
      });
    }
  }
  
  // Overall summary
  console.log('\n' + '─'.repeat(50));
  if (hasErrors) {
    console.log('❌ Validation FAILED - Please fix the errors above before deploying');
    process.exit(1);
  } else {
    console.log('✅ All validations PASSED - Ready to deploy!');
  }
}

// Run validation
main().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});