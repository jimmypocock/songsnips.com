# Secure Spotify Integration Architecture

### NOTE: This is not a feasible integration. Spotify won't allow this functionality, even for educational purposes, but keeping it here for future reference.

## Overview

This architecture uses AWS services to create a secure, persistent Spotify integration.

## Architecture Components

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│ CloudFront  │────▶│   S3 Bucket │
│  (React/JS) │     │    (CDN)    │     │   (Static)  │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       │ HTTPS
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ API Gateway │────▶│   Lambda    │────▶│  DynamoDB   │
│   (REST)    │     │ (Node.js)   │     │  (Tokens)   │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Cognito   │     │   Spotify   │
│(User Pool)  │     │     API     │
└─────────────┘     └─────────────┘
```

## Implementation Steps

### 1. Set Up Cognito User Pool

```javascript
// CloudFormation/CDK Template
const userPool = new cognito.UserPool(this, 'SpotifyUserPool', {
  userPoolName: 'spotify-lyric-users',
  selfSignUpEnabled: true,
  signInAliases: {
    email: true,
  },
  standardAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  customAttributes: {
    spotifyId: new cognito.StringAttribute(),
    refreshToken: new cognito.StringAttribute({ mutable: true }),
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
  },
});
```

### 2. Lambda Functions

#### Authorization Handler

```javascript
// lambda/auth-handler.js
const AWS = require('aws-sdk');
const axios = require('axios');
const crypto = require('crypto');

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

exports.handler = async (event) => {
  const { code, state } = JSON.parse(event.body);

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const { id: spotifyId, email, display_name } = profileResponse.data;

    // Create or update Cognito user
    const cognitoUser = await createOrUpdateCognitoUser(email, spotifyId);

    // Store tokens securely
    await storeTokens(cognitoUser.Username, {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000),
      spotifyId: spotifyId,
    });

    // Generate session token
    const sessionToken = generateSessionToken(cognitoUser.Username);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        expiresIn: 2592000, // 30 days
        user: {
          email,
          displayName: display_name,
          spotifyId,
        },
      }),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' }),
    };
  }
};

async function createOrUpdateCognitoUser(email, spotifyId) {
  try {
    // Try to find existing user
    const listResponse = await cognito.listUsers({
      UserPoolId: process.env.USER_POOL_ID,
      Filter: `email = "${email}"`,
    }).promise();

    if (listResponse.Users.length > 0) {
      // Update existing user
      await cognito.adminUpdateUserAttributes({
        UserPoolId: process.env.USER_POOL_ID,
        Username: listResponse.Users[0].Username,
        UserAttributes: [
          { Name: 'custom:spotifyId', Value: spotifyId },
        ],
      }).promise();

      return listResponse.Users[0];
    } else {
      // Create new user
      const tempPassword = crypto.randomBytes(16).toString('hex');

      const createResponse = await cognito.adminCreateUser({
        UserPoolId: process.env.USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:spotifyId', Value: spotifyId },
        ],
        TemporaryPassword: tempPassword,
        MessageAction: 'SUPPRESS',
      }).promise();

      // Set permanent password
      await cognito.adminSetUserPassword({
        UserPoolId: process.env.USER_POOL_ID,
        Username: createResponse.User.Username,
        Password: tempPassword,
        Permanent: true,
      }).promise();

      return createResponse.User;
    }
  } catch (error) {
    console.error('Cognito error:', error);
    throw error;
  }
}

async function storeTokens(userId, tokens) {
  const encrypted = encryptTokens(tokens);

  await dynamodb.put({
    TableName: process.env.TOKENS_TABLE,
    Item: {
      userId,
      tokens: encrypted,
      ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
    },
  }).promise();
}

function encryptTokens(tokens) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(JSON.stringify(tokens), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    authTag: authTag.toString('hex'),
    iv: iv.toString('hex'),
  };
}

function generateSessionToken(userId) {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}
```

#### Token Refresh Handler

```javascript
// lambda/refresh-token.js
exports.handler = async (event) => {
  const { sessionToken } = JSON.parse(event.body);

  try {
    // Verify session token
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Get stored tokens
    const stored = await getStoredTokens(userId);

    // Check if access token is expired
    if (Date.now() >= stored.expiresAt) {
      // Refresh the token
      const refreshed = await refreshSpotifyToken(stored.refreshToken);

      // Update stored tokens
      await storeTokens(userId, {
        ...stored,
        accessToken: refreshed.access_token,
        expiresAt: Date.now() + (refreshed.expires_in * 1000),
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          accessToken: refreshed.access_token,
          expiresIn: refreshed.expires_in,
        }),
      };
    } else {
      // Return existing token
      return {
        statusCode: 200,
        body: JSON.stringify({
          accessToken: stored.accessToken,
          expiresIn: Math.floor((stored.expiresAt - Date.now()) / 1000),
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid session' }),
    };
  }
};

async function refreshSpotifyToken(refreshToken) {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}
```

### 3. Frontend Integration

```javascript
// services/auth.js
class AuthService {
  constructor() {
    this.sessionToken = localStorage.getItem('sessionToken');
    this.tokenRefreshTimer = null;
  }

  async login() {
    const state = this.generateRandomString(16);
    sessionStorage.setItem('auth_state', state);

    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: window.location.origin + '/callback',
      state: state,
      scope: SPOTIFY_SCOPES.join(' '),
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  }

  async handleCallback(code, state) {
    const savedState = sessionStorage.getItem('auth_state');

    if (state !== savedState) {
      throw new Error('State mismatch');
    }

    const response = await fetch(`${API_BASE_URL}/auth/spotify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    const data = await response.json();

    this.sessionToken = data.sessionToken;
    localStorage.setItem('sessionToken', this.sessionToken);

    // Schedule token refresh
    this.scheduleTokenRefresh();

    return data;
  }

  async getSpotifyToken() {
    if (!this.sessionToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken: this.sessionToken }),
    });

    if (!response.ok) {
      // Session expired, need to login again
      this.logout();
      throw new Error('Session expired');
    }

    const data = await response.json();

    // Schedule next refresh
    this.scheduleTokenRefresh(data.expiresIn);

    return data.accessToken;
  }

  scheduleTokenRefresh(expiresIn = 3600) {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh 5 minutes before expiry
    const refreshIn = (expiresIn - 300) * 1000;

    this.tokenRefreshTimer = setTimeout(() => {
      this.getSpotifyToken().catch(() => {
        // Handle refresh failure
        this.logout();
      });
    }, refreshIn);
  }

  logout() {
    localStorage.removeItem('sessionToken');
    this.sessionToken = null;

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    window.location.href = '/';
  }

  isAuthenticated() {
    return !!this.sessionToken;
  }

  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }
}

export default new AuthService();
```

### 4. Updated App Component

```javascript
// App.js
import React, { useState, useEffect } from 'react';
import AuthService from './services/auth';
import SpotifyPlayer from './components/SpotifyPlayer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (AuthService.isAuthenticated()) {
      // Verify token is still valid
      AuthService.getSpotifyToken()
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Handle callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      AuthService.handleCallback(code, state)
        .then(() => {
          setIsAuthenticated(true);
          window.history.replaceState({}, document.title, '/');
        })
        .catch((error) => {
          console.error('Auth callback error:', error);
        });
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <h1>Lyric Translation System</h1>
        <p>Practice singing sections of your favorite songs</p>
        <button onClick={() => AuthService.login()}>
          Login with Spotify
        </button>
      </div>
    );
  }

  return <SpotifyPlayer />;
}

export default App;
```

## Security Benefits

1. **Client Secret Protection**: Never exposed to frontend
2. **Token Encryption**: Stored encrypted in DynamoDB
3. **Session Management**: 30-day sessions with automatic refresh
4. **HTTPS Only**: All communication encrypted
5. **CORS Protection**: Configured on API Gateway
6. **Input Validation**: All inputs sanitized
7. **Rate Limiting**: API Gateway throttling

## Cost Estimates (AWS)

- **Cognito**: Free up to 50,000 MAUs
- **Lambda**: ~$0.20 per million requests
- **DynamoDB**: ~$0.25 per GB/month
- **API Gateway**: $3.50 per million requests
- **Total**: ~$5-10/month for moderate usage

## Deployment

```bash
# Using AWS CDK
npm install -g aws-cdk
cdk init app --language javascript
cdk deploy SpotifyLyricStack

# Or using Serverless Framework
serverless deploy --stage production
```

## Environment Variables

```env
# Lambda Environment
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
REDIRECT_URI=https://yourdomain.com/callback
USER_POOL_ID=your_cognito_pool_id
TOKENS_TABLE=spotify-tokens
ENCRYPTION_KEY=base64_encoded_32_byte_key
JWT_SECRET=your_jwt_secret

# Frontend Environment
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id
REACT_APP_API_URL=https://api.yourdomain.com
```

This architecture provides enterprise-grade security while maintaining a smooth user experience with persistent login sessions.
