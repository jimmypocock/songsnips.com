const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const QUOTA_TABLE_NAME = process.env.QUOTA_TABLE_NAME;
const DAILY_QUOTA_LIMIT = parseInt(process.env.DAILY_QUOTA_LIMIT || '10000');
const SEARCH_QUOTA_COST = parseInt(process.env.SEARCH_QUOTA_COST || '100');

async function getQuotaStatus() {
  const today = new Date().toISOString().split('T')[0];
  const quotaKey = {
    pk: 'QUOTA#DAILY',
    sk: today
  };

  try {
    const result = await dynamodb.get({
      TableName: QUOTA_TABLE_NAME,
      Key: quotaKey
    }).promise();

    const quotaData = result.Item || {
      used: 0,
      limit: DAILY_QUOTA_LIMIT,
      searches: 0
    };

    return {
      date: today,
      used: quotaData.used,
      limit: quotaData.limit,
      remaining: Math.max(0, quotaData.limit - quotaData.used),
      searchesPerformed: quotaData.searches || 0,
      searchesRemaining: Math.floor((quotaData.limit - quotaData.used) / SEARCH_QUOTA_COST),
      percentageUsed: Math.round((quotaData.used / quotaData.limit) * 100),
      resetsAt: getNextMidnightPT(),
      quotaExceeded: quotaData.used >= quotaData.limit
    };
  } catch (error) {
    console.error('Error getting quota status:', error);
    throw error;
  }
}

function getNextMidnightPT() {
  const now = new Date();
  const pt = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const midnight = new Date(pt);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.toISOString();
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
    const quotaStatus = await getQuotaStatus();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(quotaStatus)
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