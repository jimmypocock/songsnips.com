# YouTube Search Local Development Guide

## Option 1: Deploy to AWS and Test Locally (Recommended)

This is the simplest approach - deploy the API to AWS and call it from your local Next.js app.

### 1. Deploy the API
```bash
npm run deploy:api
```

### 2. Get your API URL
After deployment, you'll see output like:
```
Outputs:
SONGSNIPS-API.ApiUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
```

### 3. Create `.env.local`
```bash
# In your project root
NEXT_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

### 4. Test the API directly
```bash
# Test quota status
curl https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/search/status

# Test search (after setting API key in Secrets Manager)
curl "https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/search?q=guitar+lesson"
```

### 5. Use in your Next.js app
```typescript
// services/searchService.ts
export class SearchService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!this.apiUrl) {
      console.error('API URL not configured');
    }
  }
  
  async checkQuota() {
    const res = await fetch(`${this.apiUrl}/api/search/status`);
    return res.json();
  }
  
  async search(query: string) {
    const res = await fetch(`${this.apiUrl}/api/search?q=${encodeURIComponent(query)}`);
    return res.json();
  }
}
```

## Option 2: Local Lambda Testing with SAM

For true local testing without AWS deployment:

### 1. Install AWS SAM CLI
```bash
brew install aws-sam-cli
```

### 2. Create SAM template
Create `cdk/template.yaml`:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10

Resources:
  SearchFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/search/
      Handler: search.handler
      Runtime: nodejs20.x
      Environment:
        Variables:
          QUOTA_TABLE_NAME: local-quota-table
          YOUTUBE_API_KEY_SECRET_NAME: local-youtube-key
          DAILY_QUOTA_LIMIT: "10000"
          SEARCH_QUOTA_COST: "100"
      Events:
        Search:
          Type: Api
          Properties:
            Path: /api/search
            Method: get

  QuotaStatusFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/quota-status/
      Handler: quota-status.handler
      Runtime: nodejs20.x
      Environment:
        Variables:
          QUOTA_TABLE_NAME: local-quota-table
          DAILY_QUOTA_LIMIT: "10000"
          SEARCH_QUOTA_COST: "100"
      Events:
        Status:
          Type: Api
          Properties:
            Path: /api/search/status
            Method: get
```

### 3. Run DynamoDB locally
```bash
# In one terminal
docker run -p 8000:8000 amazon/dynamodb-local

# Create local table
aws dynamodb create-table \
  --table-name local-quota-table \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

### 4. Mock Secrets Manager
Create `cdk/env.json`:
```json
{
  "SearchFunction": {
    "YOUTUBE_API_KEY_SECRET_NAME": "YOUR_ACTUAL_API_KEY"
  },
  "QuotaStatusFunction": {}
}
```

### 5. Start local API
```bash
cd cdk
sam local start-api --env-vars env.json
```

Your API is now running at `http://localhost:3000`!

### 6. Update `.env.local` for local testing
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Option 3: Simple Mock Service (Fastest)

For quick frontend development without AWS:

Create `services/mockSearchService.ts`:
```typescript
export class MockSearchService {
  async checkQuota() {
    return {
      date: new Date().toISOString().split('T')[0],
      used: 2000,
      limit: 10000,
      remaining: 8000,
      searchesPerformed: 20,
      searchesRemaining: 80,
      percentageUsed: 20,
      resetsAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
      quotaExceeded: false
    };
  }
  
  async search(query: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results
    return {
      items: [
        {
          videoId: 'dQw4w9WgXcQ',
          title: `Mock Result for: ${query}`,
          description: 'This is a mock search result for development',
          thumbnail: 'https://via.placeholder.com/320x180',
          channelTitle: 'Mock Channel',
          publishedAt: new Date().toISOString()
        }
      ],
      totalResults: 1,
      quotaInfo: {
        used: 2100,
        limit: 10000,
        remaining: 7900,
        searchesRemaining: 79
      }
    };
  }
}
```

Use in development:
```typescript
// In your component
const searchService = process.env.NODE_ENV === 'development' 
  ? new MockSearchService()
  : new SearchService();
```

## Recommended Development Flow

1. **Start with Option 1** - Deploy to AWS and test with real API
   - Real quota tracking
   - Real YouTube results
   - Tests CORS and security

2. **Use Option 3** for rapid UI development
   - No AWS costs
   - Instant responses
   - Easy to test edge cases

3. **Use Option 2** only if you need to debug Lambda functions locally

## Testing Checklist

- [ ] API returns quota status
- [ ] Search returns results when quota available
- [ ] Search returns quotaExceeded flag when limit reached
- [ ] CORS headers work with localhost:3000
- [ ] Error handling for network failures
- [ ] Loading states in UI
- [ ] Fallback to external search when quota exceeded