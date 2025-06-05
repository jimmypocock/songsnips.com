# YouTube Search Setup Guide

## Phase 1: Deploy API Infrastructure ✅

The API infrastructure has been created:
- **API Gateway**: REST API with CORS configured
- **Lambda Functions**: Search and quota status endpoints
- **DynamoDB Table**: Quota tracking and search caching
- **Secrets Manager**: YouTube API key storage
- **CloudWatch**: Monitoring and alerts

## Phase 2: Deploy and Configure

### Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. (Optional) Restrict key to your domain

### Step 2: Deploy API Stack

```bash
cd cdk

# Full deployment with dependency installation
npm run deploy:api

# Or just deploy the stack (if dependencies are already installed)
npm run deploy:api:only

# Check what will be deployed
npm run diff:api

# Destroy the API stack if needed
npm run destroy:api
```

### Step 3: Set API Key in AWS Secrets Manager

1. Go to AWS Console → Secrets Manager
2. Find secret: `your-domain.com-youtube-api-key`
3. Click "Retrieve secret value" → "Edit"
4. Set the plain text value to your YouTube API key
5. Save

### Step 4: Update CDN for API Routing

There are two approaches:

#### Option A: Manual CDN Update (Recommended for now)
Since your CDN is already deployed, we can test the API directly first:

1. The API is accessible at the URL shown in the deployment output
2. Test it: `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/search/status`
3. Implement frontend to call API directly (with CORS)

#### Option B: Integrate with CloudFront (Later)
To route API through CloudFront (same domain):

1. Update CDN stack to add API as origin
2. Redeploy CDN (takes ~20 minutes)
3. Access API at: `https://www.yourdomain.com/api/*`

## Phase 3: Frontend Implementation

### Search Service

Create `/services/searchService.ts`:

```typescript
export class SearchService {
  private apiUrl: string;
  
  constructor() {
    // For now, use direct API Gateway URL
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 
      'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod';
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

### Environment Variable

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

## Testing the API

### Test Quota Status
```bash
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/search/status
```

Expected response:
```json
{
  "date": "2025-01-06",
  "used": 0,
  "limit": 10000,
  "remaining": 10000,
  "searchesPerformed": 0,
  "searchesRemaining": 100,
  "percentageUsed": 0,
  "resetsAt": "2025-01-07T08:00:00.000Z",
  "quotaExceeded": false
}
```

### Test Search
```bash
curl "https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/search?q=guitar+lesson"
```

## Monitoring

- **CloudWatch Dashboards**: View API metrics
- **Quota Alerts**: Email alerts at 80% usage
- **Error Tracking**: Lambda error alerts

## Next Steps

1. ✅ API Infrastructure deployed
2. ⏳ Set YouTube API key in Secrets Manager
3. ⏳ Test API endpoints
4. ⏳ Implement frontend search UI
5. ⏳ Add search caching optimization
6. ⏳ Consider CloudFront integration