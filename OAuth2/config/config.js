require('dotenv').config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    tokenExpiration: 3600 // 1 hour in seconds
  },
  server: {
    port: process.env.PORT || 3000
  }
};

module.exports = config;
