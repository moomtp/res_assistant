const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./config/config");
const clientManager = require("./clientManager");

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the revoked tokens set
const revokedTokens = new Set();

app.get("/token", async(req, res)=>{
  
})
// Token generation endpoint
app.post("/token", async (req, res) => {
  try {
    const { client_id, client_secret, grant_type } = req.body;

    // Validate request parameters
    if (!client_id || !client_secret || grant_type !== "client_credentials") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing or invalid parameters"
      });
    }

    // Validate client credentials
    const clientInfo = await clientManager.validateClient(client_id, client_secret);
    if (!clientInfo) {
      return res.status(401).json({
        error: "invalid_client",
        error_description: "Invalid client credentials"
      });
    }

    // Generate token with explicit expiration
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + config.jwt.tokenExpiration;

    const accessToken = jwt.sign(
      {
        client_id: clientInfo.clientId,
        scope: clientInfo.scope,
        name: clientInfo.name,
        type: "access_token",
        iat: issuedAt,
        exp: expiresAt
      },
      config.jwt.secret
    );

    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: config.jwt.tokenExpiration,
      scope: clientInfo.scope.join(" "),
      client_name: clientInfo.name,
      issued_at: issuedAt,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      error: "server_error",
      error_description: "An error occurred while processing the request"
    });
  }
});

//  =======   validation section  =============

// Utility function to extract token from Authorization header
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Token validation endpoint
app.post('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check token type
    if (decoded.type !== 'access_token') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid token type'
      });
    }

    // Check if token is revoked
    if (revokedTokens.has(token)) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token has been revoked'
      });
    }

    // Validate client still exists and is active
    const clientInfo = await clientManager.getClientInfo(decoded.client_id);
    if (!clientInfo) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Client no longer active'
      });
    }

    // Optional: Check if specific scope is required
    const requiredScope = req.body.required_scope;
    if (requiredScope && !decoded.scope.includes(requiredScope)) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Token does not have required scope'
      });
    }

    // Return token information
    res.json({
      valid: true,
      client_id: decoded.client_id,
      client_name: decoded.name,
      scope: decoded.scope,
      expires_at: decoded.exp,
      issued_at: decoded.iat
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: error.message
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token has expired'
      });
    }

    console.error('Token validation error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'An error occurred while validating the token'
    });
  }  
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});



app.listen(config.server.port, () => {
  console.log(`OAuth 2.0 server running on port ${config.server.port}`);
});
