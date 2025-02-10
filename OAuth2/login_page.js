exports.loginPage = (responseurl, client_id) =>{
return  `
<!DOCTYPE html>
<html>
<head>
    <title>登入頁面</title>
</head>
<body>
    <form id="loginForm">
        <input type="hidden" name="responseurl" value="${responseurl}" />
        <input type="hidden" name="client_id" value="${client_id}" />

        <input type="text" id="username" name="username" placeholder="使用者名稱" required>
        <input type="password" id="password" name="password" placeholder="密碼" required>
        <button type="submit">登入</button>
    </form>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 獲取表單數據
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                // 發送 POST 請求到後端
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 登入成功
                    alert('登入成功！');
                    window.location.href = '/dashboard'; // 導向到儀表板
                } else {
                    // 登入失敗
                    alert(data.message || '登入失敗');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('發生錯誤，請稍後再試');
            }
        });
    </script>
</body>
</html>
`;

}
