# pylint: disable=unused-import

import requests
# import jwt 
# from dotenv import load_dotenv
# from functools import wraps
#
# import os 

def test_integration():
    # OAuth2 service configuration
    # oauth_server = "http://localhost:3000"
    oauth_server = "http://10.123.250.15:32571"
    api_server = "http://10.123.250.15:30726"
    # api_server = "http://localhost:5000"
    
    # Step 1: Get OAuth token
    token_response = requests.post(
        f"{oauth_server}/token",
        json={
            "client_id": "client_id_A",
            "client_secret": "client_secret_A",
            "grant_type": "client_credentials"
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
