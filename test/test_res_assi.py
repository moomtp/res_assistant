# pylint: disable=unused-import

import requests
import sys

# sys.argv 是一個列表，包含執行命令時的所有參數
print("腳本名稱:", sys.argv[0])  # 第一個元素是腳本名稱
if len(sys.argv) > 1:
    print("傳入的參數:", sys.argv[1:])  # 讀取所有參數（從 index 1 開始）
    ip =  sys.argv[1]
else:
    ip = "192.168.1.106"

# import jwt 
# from dotenv import load_dotenv
# from functools import wraps
#
# import os 

def test_integration():
    # OAuth2 service configuration
    # oauth_server = "http://localhost:3000"
    # api_server = "http://localhost:5000"
   
    # staging ip
    # oauth_server = "http://10.123.250.15:32571"
    # api_server = "http://10.123.250.15:30726"
    
    # product ip
    # oauth_server = "http://192.168.1.106:30030"
    # api_server = "http://192.168.1.106:30050"


    oauth_server = "http://" + ip  + ":30030"
    api_server = "http://" + ip  + ":30050"
    
    # Step 1: Get OAuth token
    token_response = requests.post(
        f"{oauth_server}/token",
        json={
            "client_id": "client_id_A",
            "client_secret": "client_secret_A",
            "grant_type": "client_credentials",
            "authCode": "xxxxxx",
            
        }
    )
    
    if token_response.status_code != 200:
        print("Failed to get token:", token_response.json())
        # return
        
    # Extract token
    token_data = token_response.json()
    print(token_data)
    access_token = token_data['access_token']
    print(access_token)
    
    # Step 2: Use token to access protected Flask API
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    print(headers)
    
    # Test /api/data endpoint
    data_response = requests.post(
        f"{oauth_server}/validate",
        headers=headers
    )
    print("\nData API Response:", data_response.json())

    # Test token
    # token_response = requests.post(
    #     f"{oauth_server}/token",
    #     json={
    #         "client_id": "client_id_A",
    #         "client_secret": "your-secret-for-A",
    #         "grant_type": "client_credentials"
    #     }
    # )    

    print(data_response)
    
    # Test res assi endpoint
    admin_response = requests.post(
        f"{api_server}/control-device",
        headers=headers,
        json={
            "command" : "turn_aircon_off",
        }
        
    )
    print("\nAdmin API Response:", admin_response.json())

if __name__ == "__main__":
    test_integration()
