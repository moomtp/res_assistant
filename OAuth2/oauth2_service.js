const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./config/config");
const clientManager = require("./clientManager");
const {loginPage} = require('./login_page')
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret_key", resave: false, saveUninitialized: true }));
app.use(cookieParser()); // 解析 Cookie

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query Params:', req.query);
  console.log('Body:', req.body);
  next();
});

// Initialize the revoked tokens set
const revokedTokens = new Set();



app.get("/login", (req, res) => {
  const { redirect_uri, state } = req.query;

  res.send(`
    <h2>請登入</h2>
    <form method="POST" action="/login">
      <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
      <input type="hidden" name="state" value="${state}" />
      <label>帳號: <input type="text" name="username" required /></label><br />
      <label>密碼: <input type="password" name="password" required /></label><br />
      <button type="submit">登入</button>
    </form>
  `);
});

/**
 * 處理登入請求
 */
app.post("/login", (req, res) => {
  const { username, password, redirect_uri, state } = req.body;

  // 模擬帳號密碼驗證（這裡應該連接資料庫驗證）
  if (username === "user" && password === "pass") {
    req.session.user = username; // 設定 Session

    // 登入成功後導向 `/fakeauth` 進行授權碼發放
    return res.redirect(`/auth?redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`);
  }

  return res.status(401).send("登入失敗，請重新嘗試。");
});




app.get("/auth", (req, res) => {
  const { redirect_uri, state } = req.query;

  if (!req.session.user) {
    // 未登入 -> 導向登入頁面
    return res.redirect(`/login?redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`);
  }

  // 模擬固定的授權碼 (可以改成隨機值)
  const authCode = "xxxxxx";

  // 構造回調 URL
  const responseUrl = `${decodeURIComponent(redirect_uri)}?code=${authCode}&state=${state}`;
  console.log(`Redirecting to: ${responseUrl}`);

  return res.redirect(responseUrl);
});

// oauth test url sample : http://127.0.0.1:3000/auth?redirect_uri=https://www.google.com/

// Token 生成端點
app.post("/token", async (req, res) => {
  try {
    const { client_id, client_secret, grant_type } = req.body;
    const {authCode} = req.body;
    
    // 驗證請求參數是否完整且正確
    if (!client_id || !client_secret || grant_type !== "client_credentials") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing or invalid parameters"
      });
    }

    if(!authCode){
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing authCode"
      });
    }

    if(authCode != "xxxxxx"){
      return res.status(400).json({
        error: "invalid_request",
        error_description: "authCode mismatch"
      });
    }

    // 驗證客戶端憑證是否有效
    const clientInfo = await clientManager.validateClient(client_id, client_secret);
    if (!clientInfo) {
      return res.status(401).json({
        error: "invalid_client",
        error_description: "Invalid client credentials"
      });
    }

    // 生成帶有明確過期時間的 token
    const issuedAt = Math.floor(Date.now() / 1000);  // 獲取當前時間戳（秒）
    const expiresAt = issuedAt + config.jwt.tokenExpiration;  // 計算過期時間
    
    // 使用 JWT 簽署 token，包含必要的訊息
    const accessToken = jwt.sign(
      {
        client_id: clientInfo.clientId,    // 客戶端 ID
        scope: clientInfo.scope,           // 權限範圍
        name: clientInfo.name,             // 客戶端名稱
        type: "access_token",              // token 類型
        iat: issuedAt,                     // 簽發時間
        exp: expiresAt                     // 過期時間
      },
      config.jwt.secret                    // 使用配置的密鑰進行簽署
    );

    // 返回成功生成的 token 資訊
    res.json({
      access_token: accessToken,
      token_type: "bearer",
      expires_in: config.jwt.tokenExpiration,
      scope: clientInfo.scope.join(" "),
      client_name: clientInfo.name,
      issued_at: issuedAt,
      expires_at: expiresAt
    });

  } catch (error) {
    // 錯誤處理：記錄錯誤並返回適當的錯誤響應
    console.error('Token generation error:', error);
    res.status(500).json({
      error: "server_error",
      error_description: "An error occurred while processing the request"
    });
  }
});

// ======= Token 驗證部分 =============

// Token 驗證端點
app.post('/validate', async (req, res) => {
  try {
    // 從請求標頭中獲取授權資訊
    const authHeader = req.headers.authorization;
    
    // 檢查授權標頭是否存在且格式正確
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid Authorization header'
      });
    }

    // 提取 token（移除 'Bearer ' 前綴）
    const token = authHeader.substring(7);

    // 驗證 token 的有效性
    const decoded = jwt.verify(token, config.jwt.secret);

    // 檢查 token 類型是否正確
    if (decoded.type !== 'access_token') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid token type'
      });
    }

    // 檢查 token 是否已被撤銷
    if (revokedTokens.has(token)) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token has been revoked'
      });
    }

    // 驗證客戶端是否仍然存在且處於活動狀態
    const clientInfo = await clientManager.getClientInfo(decoded.client_id);
    if (!clientInfo) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Client no longer active'
      });
    }

    // 可選：檢查是否需要特定的權限範圍
    const requiredScope = req.body.required_scope;
    if (requiredScope && !decoded.scope.includes(requiredScope)) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Token does not have required scope'
      });
    }

    // 返回 token 的驗證資訊
    res.json({
      valid: true,
      client_id: decoded.client_id,
      client_name: decoded.name,
      scope: decoded.scope,
      expires_at: decoded.exp,
      issued_at: decoded.iat
    });
  } catch (error) {
    // JWT 相關錯誤處理
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: error.message
      });
    }
    // token 過期錯誤處理
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Token has expired'
      });
    }
    // 其他錯誤處理
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






//  gc
// app.get("/login", async (req, res) => {
//   const { responseurl, client_id } = req.query;
//   res.send(loginPage(responseurl, client_id));
// })
// app.post("/login", async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const { responseurl } = req.body;

        // if (!username || !password) {
        //     return res.status(400).json({
        //         success: false,
        //         message: '請輸入使用者名稱和密碼'
        //     });
        // }

        // const [rows] = await pool.execute(
        //     'SELECT * FROM users WHERE username = ?',
        //     [username]
        // );
        //
        // const user = rows[0];
        //
        // if (!user) {
        //     return res.status(401).json({
        //         success: false,
        //         message: '使用者名稱或密碼錯誤'
        //     });
        // }
        //
        // const isValidPassword = await bcrypt.compare(password, user.password);
        //
        // if (!isValidPassword) {
        //     return res.status(401).json({
        //         success: false,
        //         message: '使用者名稱或密碼錯誤'
        //     });
        // }

        // res.json({
        //     success: true,
        //     message: '登入成功',
            // user: {
            //     id: user.id,
            //     username: user.username
            // }
//         });
//       res.redirect(decodeURIComponent(responseurl));
//
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             success: false,
//             message: '伺服器錯誤'
//         });
//     }
// })

