# 使用官方的 Node.js 12 版本
FROM node:12

# 設定應用目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json 並安裝依賴
COPY package*.json ./
RUN npm install 

# 複製應用源代碼
COPY . .

# 暴露應用運行的端口
EXPOSE 3000

# 啟動應用
CMD ["node", "oauth2_service.js"]
