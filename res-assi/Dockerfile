# 使用官方的 Node.js 12 版本
FROM python:3.10-slim

# 設定應用目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 並安裝依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用源代碼
COPY . .

# 暴露應用運行的端口
EXPOSE 3000

# 啟動應用
# CMD ["python3", "res_assi_service.py"]


ENV SERVICE_OAUTH_HOST=oauth2-server.default.svc.cluster.local

# CMD python3 res_assi_service.py --oauth_host= ${oauth_host:-oauth2-server.default.svc.cluster.local}
CMD python3 res_assi_service.py --oauth_host=${SERVICE_OAUTH_HOST}

