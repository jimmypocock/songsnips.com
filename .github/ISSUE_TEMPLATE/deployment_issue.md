---
name: Deployment Issue
about: Report issues with AWS deployment or CDK stacks
title: '[DEPLOYMENT] '
labels: ['deployment', 'aws']
assignees: ''

---

**Which deployment step is failing?**

- [ ] CDK Bootstrap
- [ ] Foundation Stack
- [ ] Certificate Stack
- [ ] Edge Functions Stack
- [ ] WAF Stack
- [ ] CDN Stack
- [ ] App Stack
- [ ] Monitoring Stack
- [ ] Other (please specify)

**Error message**

Please paste the complete error message here:

```
Paste error message here
```

**Deployment command used**

What command did you run when the error occurred?
```bash
# Example: npm run deploy:foundation
```

**AWS Environment**

- AWS Region: [e.g. us-east-1]
- AWS Account ID: [first 4 digits only, e.g. 1234...]
- AWS CLI version: [e.g. 2.13.0]
- CDK version: [e.g. 2.100.0]

**Configuration**

Please share your configuration (remove sensitive values):

**Environment variables (.env):**
```bash
APP_NAME=your-app-name
DOMAIN_NAME=your-domain.com
STACK_PREFIX=YOURAPP
# etc. (remove actual values)
```

**CDK Context (if any):**
```json
{
  "certificateArn": "arn:aws:acm:...",
  "createCertificate": "true"
}
```

**Stack Status**

If you can access AWS CloudFormation console, please share the status of your stacks:
- Foundation Stack: [e.g. CREATE_COMPLETE, CREATE_FAILED]
- Certificate Stack: [e.g. CREATE_IN_PROGRESS]
- etc.

**Logs**

If available, please include relevant CloudFormation events or CDK logs:

```
Paste logs here
```

**Additional context**

- Is this your first deployment or an update?
- Have you successfully deployed other stacks?
- Any custom modifications to the template?