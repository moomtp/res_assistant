const axios = require('axios');
const config = require("./config/config");

async function testOAuth() {
  try {
    // Step 1: Get token
    console.log('Getting token...');
    const tokenRes = await axios.post('http://localhost:3000/token', {
      client_id: 'client_id_A',
      client_secret: 'your-secret-for-A',
      grant_type: 'client_credentials'
    });
    
    const token = tokenRes.data.access_token;
    console.log('Token received:', token);

    // Step 2: Access protected resource
    console.log('\nAccessing protected resource...');
    const protectedRes = await axios.post('http://localhost:3000/validate', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Protected resource response:', protectedRes.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testOAuth();