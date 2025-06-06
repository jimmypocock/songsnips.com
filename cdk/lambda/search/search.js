const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager();

const QUOTA_TABLE_NAME = process.env.QUOTA_TABLE_NAME;
const YOUTUBE_API_KEY_SECRET_NAME = process.env.YOUTUBE_API_KEY_SECRET_NAME;
const DAILY_QUOTA_LIMIT = parseInt(process.env.DAILY_QUOTA_LIMIT || '10000');
const SEARCH_QUOTA_COST = parseInt(process.env.SEARCH_QUOTA_COST || '100');

let cachedApiKey = null;

async function getYouTubeApiKey() {
  if (cachedApiKey) return cachedApiKey;
  
  try {
    const secret = await secretsManager.getSecretValue({ 
      SecretId: YOUTUBE_API_KEY_SECRET_NAME 
    }).promise();
    
    cachedApiKey = secret.SecretString;
    return cachedApiKey;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    throw new Error('Failed to retrieve YouTube API key');
  }
}

async function checkAndUpdateQuota() {
  const today = new Date().toISOString().split('T')[0];
  const quotaKey = {
    pk: 'QUOTA#DAILY',
    sk: today
  };

  try {
    // Get current quota
    const result = await dynamodb.get({
      TableName: QUOTA_TABLE_NAME,
      Key: quotaKey
    }).promise();

    let quotaData = result.Item || {
      ...quotaKey,
      used: 0,
      limit: DAILY_QUOTA_LIMIT,
      searches: 0
    };

    // Check if quota would be exceeded
    if (quotaData.used + SEARCH_QUOTA_COST > quotaData.limit) {
      return { allowed: false, quotaData };
    }

    // Update quota
    quotaData.used += SEARCH_QUOTA_COST;
    quotaData.searches += 1;
    quotaData.lastUpdated = new Date().toISOString();
    quotaData.ttl = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days TTL

    await dynamodb.put({
      TableName: QUOTA_TABLE_NAME,
      Item: quotaData
    }).promise();

    // Publish metric for monitoring
    const quotaPercentage = (quotaData.used / quotaData.limit) * 100;
    await publishMetric('QuotaUsagePercentage', quotaPercentage);

    return { allowed: true, quotaData };
  } catch (error) {
    console.error('Error checking quota:', error);
    throw error;
  }
}

async function searchYouTube(query, maxResults = 5, type = 'video') {
  const apiKey = await getYouTubeApiKey();
  
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      maxResults: maxResults.toString(),
      type: type,
      videoEmbeddable: 'true',
      key: apiKey
    });

    const options = {
      hostname: 'www.googleapis.com',
      path: `/youtube/v3/search?${params}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          console.error('YouTube API error:', res.statusCode, data);
          reject(new Error(`YouTube API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.end();
  });
}

async function getCachedSearch(query) {
  try {
    const result = await dynamodb.get({
      TableName: QUOTA_TABLE_NAME,
      Key: {
        pk: `SEARCH#${query.toLowerCase()}`,
        sk: 'CACHE'
      }
    }).promise();

    if (result.Item && result.Item.results) {
      const cacheAge = Date.now() - new Date(result.Item.cachedAt).getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      
      if (cacheAge < ONE_HOUR) {
        return result.Item.results;
      }
    }
  } catch (error) {
    console.error('Cache lookup error:', error);
  }
  
  return null;
}

async function cacheSearch(query, results) {
  try {
    await dynamodb.put({
      TableName: QUOTA_TABLE_NAME,
      Item: {
        pk: `SEARCH#${query.toLowerCase()}`,
        sk: 'CACHE',
        results: results,
        cachedAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour TTL
      }
    }).promise();
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

async function publishMetric(metricName, value) {
  const cloudwatch = new AWS.CloudWatch();
  
  try {
    await cloudwatch.putMetricData({
      Namespace: 'YouTubeSearchAPI',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: 'Percent',
        Timestamp: new Date(),
        Dimensions: [{
          Name: 'Environment',
          Value: 'Production'
        }]
      }]
    }).promise();
  } catch (error) {
    console.error('Error publishing metric:', error);
  }
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:3737',
  'https://www.songsnips.com',
  'https://songsnips.com'
];

function getCorsHeaders(origin) {
  // Check if the origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Get the origin from the request headers
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCorsHeaders(origin);

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const query = event.queryStringParameters?.q || event.q;
    const maxResults = parseInt(event.queryStringParameters?.maxResults || event.maxResults || '5');
    const type = event.queryStringParameters?.type || event.type || 'video';

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing search query parameter' })
      };
    }

    // Check cache first
    const cachedResults = await getCachedSearch(query);
    if (cachedResults) {
      console.log('Returning cached results');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...cachedResults,
          cached: true
        })
      };
    }

    // Check quota
    const { allowed, quotaData } = await checkAndUpdateQuota();

    if (!allowed) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          quotaExceeded: true,
          quotaInfo: {
            used: quotaData.used,
            limit: quotaData.limit,
            remaining: Math.max(0, quotaData.limit - quotaData.used),
            resetsAt: getNextMidnightPT()
          }
        })
      };
    }

    // Perform search
    const searchResults = await searchYouTube(query, maxResults, type);

    // Transform results for frontend
    const transformedResults = {
      items: searchResults.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      })),
      totalResults: searchResults.items.length,
      quotaInfo: {
        used: quotaData.used,
        limit: quotaData.limit,
        remaining: Math.max(0, quotaData.limit - quotaData.used),
        searchesRemaining: Math.floor((quotaData.limit - quotaData.used) / SEARCH_QUOTA_COST)
      }
    };

    // Cache results
    await cacheSearch(query, transformedResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedResults)
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

function getNextMidnightPT() {
  const now = new Date();
  const pt = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const midnight = new Date(pt);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.toISOString();
}