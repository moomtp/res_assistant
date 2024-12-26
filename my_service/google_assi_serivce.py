from flask import Flask, request, jsonify, redirect, url_for

from my_module.costum_broadlink import BroadDevice

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.assistant.library import Assistant
import os 

import logging

# def global var
SCOPES = ["https://www.googleapis.com/auth/assistant-sdk-prototype"]
CLIENT_SECRET_FILE = './google_OAuth_certificate.json'
REDIRECT_URI = 'http://localhost:5000/callback'

# create needed object
app = Flask(__name__)
broad_agent = BroadDevice("192.168.1.115")


flow = InstalledAppFlow.from_client_secrets_file(
    CLIENT_SECRET_FILE, scopes= SCOPES, redirect_uri=REDIRECT_URI  # 確保這與 Google Console 中的設置一致
)

REDIRECT_URI = 'http://localhost:5000/callback'

logging.basicConfig(level=logging.INFO)



@app.route('/')
def index():
    authorization_url, state = flow.authorization_url(prompt='consent')
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    credentials = flow.fetch_token(authorization_response=request.url)
    # 儲存憑證或處理後續步驟
    app.logger.info("OAuth Flow Completed")
    return 'OAuth Flow Completed!'

# LED_PIN = 17
# GPIO.setmode(GPIO.BCM)
# GPIO.setup(LED_PIN, GPIO.OUT)
@app.route('/webhook', methods=["POST"])
def webhook():
    # log setting

    try : 
        req = request.get_json()
        if not req:
            return jsonify({"status": "error", "message": "Invalid request format"}), 400
    except Exception as e:
        app.logger.error(f"Exception in webhook : {str(e)}")

    intent = req.get('queryResult', {}).get('intent', {}).get('displayName', 'Unknown')
    command = req.get('queryResult', {}).get('parameters', {}).get('command')
    

    if intent == 'turn_on':
        # GPIO.output(LEFD_PIN, GPIO.HIGH)
        return "Device turned on"
    elif intent == 'set_28_degree':
        broad_agent.send_sign('28')
        return "set air con to 28 degree"
    elif intent == 'set_27_degree':
        broad_agent.send_sign('27')
        return "set air con to 27 degree"
    elif intent == 'set_26_degree':
        broad_agent.send_sign('26')
        return "set air con to 26 degree"
    elif intent == 'set_25_degree':
        broad_agent.send_sign('25')
        return "set air con to 25 degree"
    elif intent == 'turn_aircon_off':
        broad_agent.send_sign('off')
        return "turn off the air condition"

    return "no_op"



@app.route('/control-device', methods=["POST"])

def control_device():
    command = request.json.get('command')
    # query_param1 = request.args.get('param1')
    command = request.args.get('param1')
    if command == 'turn_on':
        # GPIO.output(LEFD_PIN, GPIO.HIGH)
        return "Device turned on"
    elif command == 'set_28_degree':
        broad_agent.send_sign('28')
        return "set air con to 28 degree"
    elif command == 'set_27_degree':
        broad_agent.send_sign('27')
        return "set air con to 27 degree"
    elif command == 'set_26_degree':
        broad_agent.send_sign('26')
        return "set air con to 26 degree"
    elif command == 'set_25_degree':
        broad_agent.send_sign('25')
        return "set air con to 25 degree"
    elif command == 'turn_aircon_off':
        broad_agent.send_sign('off')
        return "turn off the air condition"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 5000)



