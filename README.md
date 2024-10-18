# res_assistant
## Usage
1. 在respberry pi 上安裝k3s
```
curl -sfL https://get.k3s.io | sh -
kubectl get nodes
```

2. 在Google Cloud Console中創建專案 並啟用google assistant專案
   
3. 設置 OAuth 授權：進入 "Credentials" 頁面，創建一個 OAuth 2.0 憑證，讓 Raspberry Pi 與 Google Assistant 進行認證
   
4. 下載憑證文件：下載 OAuth 憑證文件，該檔案將用於在 Raspberry Pi 上進行認證

5. 容器化Google Assistant 服務，讓其在 Kubernetes 中運行。


dockerfile
```
FROM python:3.9-slim

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "google_assistant.py"]
```

6. 創建 google_assistant.py 腳本： 使用 Google Assistant SDK 的 Python 客戶端，創建一個簡單的語音控制腳本。

在 requirements.txt 文件中加入：
```
google-assistant-sdk[samples]
```

7. 構建 Docker 映像：

```bash
docker build -t google-assistant:latest .
```
8. 推送到 Docker Hub（或私有的 Docker registry）：

```bash
docker tag google-assistant:latest your_dockerhub_username/google-assistant
docker push your_dockerhub_username/google-assistant
```
9. 部署到Kubernetes, 創建 Kubernetes 部署檔案（google-assistant-deployment.yaml）：

```yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: google-assistant
spec:
  replicas: 1
  selector:
    matchLabels:
      app: google-assistant
  template:
    metadata:
      labels:
        app: google-assistant
    spec:
      containers:
      - name: google-assistant
        image: your_dockerhub_username/google-assistant
        ports:
        - containerPort: 5000
        volumeMounts:
        - name: creds
          mountPath: /path/to/your/credentials
      volumes:
      - name: creds
        secret:
          secretName: google-assistant-creds
```
部署到 Kubernetes：

```bash
    kubectl apply -f google-assistant-deployment.yaml
```

10. 測試 Google Assistant

使用命令行或麥克風與 Google Assistant 互動。查看容器中的日誌，確認服務是否正常運行：

```bash
kubectl logs deployment/google-assistant
```
11. 監控與擴展

使用 Kubernetes 的自動擴展特性，根據流量需求自動擴展 Google Assistant 的實例數量。你也可以集成監控工具如 Prometheus 或 Grafana，來實時監控服務的性能和健康狀態。

## Tech Stack
硬體平台：Raspberry Pi  <br>
容器技術：Kubernetes  <br>
配置管理工具：Ansible  <br>

DDNS服務 : no-ip
