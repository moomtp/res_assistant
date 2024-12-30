// ---token generator---
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const clients = {
  "client_id_A": "client_secret_A",
};

app.post("/token", (req, res) => {
  const { client_id, client_secret, grant_type } = req.body;

  if (!client_id || !client_secret || grant_type !== "client_credentials") {
    // console.log(client_id);
    return res.status(400).json({ error: "Invalid request" });
  }

  // 驗證 client_id 和 client_secret
  if (clients[client_id] !== client_secret) {
    return res.status(401).json({ error: "Invalid client credentials" });
  }

  // 簽發 Access Token
  const accessToken = "ACCESS_TOKEN_EXAMPLE";
  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600, // 有效期 1 小時
  });
});




// --- validate token is correct or not ---
const validTokens = ["ACCESS_TOKEN_EXAMPLE"]; // 模擬的有效 Token 列表

app.post("/protected-resource", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  // 驗證 Access Token
  if (!validTokens.includes(token)) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.json({ message: "Access granted to protected resource" });
});



app.listen(3000, () => console.log("Authorization Server is running on port 3000"));