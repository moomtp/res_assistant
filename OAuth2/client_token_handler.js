// request token from services/token
const axios = require("axios");

async function getAccessToken() {
  try {
    const response = await axios.post("http://localhost:3000/token", {
      client_id: "client_id_A",
      client_secret: "client_secret_A",
      grant_type: "client_credentials",
    });

    console.log("Access Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting token:", error.response.data);
  }
}

getAccessToken();


// add token at POST request
async function sendPostRequest() {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      "http://localhost:3000/protected-resource",
      { data: "example" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error sending request:", error.response.data);
  }
}

sendPostRequest();