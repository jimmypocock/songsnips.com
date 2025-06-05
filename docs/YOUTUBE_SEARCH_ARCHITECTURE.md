# YouTube Search Architecture Plan

## Overview
This document outlines the serverless architecture for adding YouTube search functionality to SongSnips with automatic quota management and graceful fallback to external search when limits are reached.

## Architecture Diagram

```
User → CloudFront → S3 (Static Site)
         ↓
      API Gateway → Lambda → DynamoDB (Quota)
                      ↓
                  YouTube API v3
```

## AWS Services Architecture

### 1. **New CDK Stack: `ApiStack`**
```typescript
// cdk/src/api-stack.ts
- API Gateway REST API
- Lambda functions (Node.js)
- DynamoDB table for quota tracking
- Secrets Manager for YouTube API key
```

### 2. **Lambda Functions**

**a) Search Function** (`/api/search`)
```typescript
// Handles search requests with quota checking
- Check quota in DynamoDB
- If quota available → Call YouTube API
- If quota exceeded → Return fallback flag
- Update quota usage in DynamoDB
```

**b) Quota Status Function** (`/api/search/status`)
```typescript
// Returns current quota status
- Read from DynamoDB
- Return remaining searches & reset time
```

### 3. **DynamoDB Schema**
```typescript
Table: youtube-search-quota
- PK: "QUOTA#DAILY"
- date: "2025-01-06"
- used: 500
- limit: 10000
- ttl: 1736208000 (auto-cleanup)
```

### 4. **API Gateway Setup**
- CORS enabled for your domain
- Rate limiting per IP (prevent abuse)
- Integration with CloudFront via behavior pattern

### 5. **CloudFront Integration**
```typescript
// Add behavior to existing distribution
"/api/*" → API Gateway origin
"/*" → S3 origin (existing)
```

### 6. **Local Development Setup**

**For Lambda development:**
```bash
# Install SAM CLI for local Lambda
brew install aws-sam-cli

# Local API Gateway
sam local start-api
```

**For DynamoDB:**
```bash
# Docker compose for DynamoDB local
docker run -p 8000:8000 amazon/dynamodb-local
```

### 7. **Frontend Integration**

```typescript
// services/searchService.ts
class SearchService {
  async checkQuota() {
    const res = await fetch('/api/search/status');
    return res.json();
  }
  
  async search(query: string) {
    const res = await fetch(`/api/search?q=${query}`);
    const data = await res.json();
    
    if (data.quotaExceeded) {
      return { fallbackMode: true };
    }
    
    return data;
  }
}
```

### 8. **Deployment Flow**

```bash
# 1. Deploy API stack
npm run deploy -- ApiStack

# 2. Update CDN stack to add API behavior
npm run deploy -- CDNStack

# 3. Deploy app with new search UI
npm run build && npm run deploy -- AppStack
```

### 9. **Costs**
- **Lambda**: ~$0 (free tier covers millions of requests)
- **API Gateway**: $3.50 per million requests
- **DynamoDB**: ~$0 (free tier: 25GB storage, 25 read/write units)
- **Total**: Essentially free until massive scale

### 10. **Benefits of This Approach**
- No API key exposed in frontend
- Automatic quota management
- Graceful fallback to external search
- Easy to monitor/debug
- Scales automatically
- Minimal costs

## Implementation Details

### YouTube API Quota Management
- Default quota: 10,000 units/day
- Search cost: 100 units per search
- Maximum searches per day: 100 (with default quota)
- Quota resets: Midnight Pacific Time

### Fallback Strategy
When quota is exceeded:
1. Frontend receives `quotaExceeded: true` flag
2. UI switches to "Search on YouTube" button
3. Opens YouTube search in new tab
4. User can copy video URL back to SongSnips

### Caching Strategy
To maximize quota efficiency:
- Cache popular searches at CloudFront edge
- Cache search results in DynamoDB with 1-hour TTL
- Implement client-side caching for recent searches

### Security Considerations
- API key stored in AWS Secrets Manager
- Lambda functions have minimal IAM permissions
- API Gateway rate limiting prevents abuse
- CORS configured for specific domain only

### Monitoring & Alerts
- CloudWatch alarms for:
  - Quota usage > 80%
  - Lambda errors
  - API Gateway 4xx/5xx rates
- Daily quota usage reports

### Future Enhancements
1. **User accounts** - Per-user quota allocation
2. **Premium tier** - Higher quota limits for paid users
3. **Search analytics** - Track popular searches
4. **Predictive caching** - Pre-cache trending music searches
5. **Multiple API keys** - Rotate between keys for higher limits