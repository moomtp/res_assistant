from flask import Flask, request, jsonify
import requests

from my_module.costum_broadlink import BroadDevice

import logging
import os

# Configuration
#

# oauth_ip = os.getenv("oauth_HOST", "service-b.default.svc.cluster.local")
oauth_ip = os.getenv("SERVICE_OAUTH_HOST", "localhost")
class Config:
    OAUTH_SERVER = "http://" + oauth_ip + ":3000"
config = Config()

# create needed object
app = Flask(__name__)
broad_agent = BroadDevice("192.168.1.115")


logging.basicConfig(level=logging.INFO)



@app.route('/control-device', methods=["POST"])
def control_device():
    
    # check OAuth2.0 token is valid or not
    headers = {key: value for key, value in request.headers.items()}
    oauth_token = {
        'Authorization' : headers.get("Authorization")
    }
    oauth_respone = requests.post(
        f"{config.OAUTH_SERVER}/validate",
        headers=oauth_token,
    )
    if 'read' not in  oauth_respone.json().get('scope'):
        return jsonify({'error': 'Insufficient scope'}), 403


    command = request.get_json().get('command')
    if command == 'turn_on':  # dummy Ops
        # GPIO.output(LEFD_PIN, GPIO.HIGH)
        mes = "Device turned on"
    elif command == 'set_28_degree':
        broad_agent.send_sign('28')
        mes = "set air con to 28 degree"
    elif command == 'set_27_degree':
        broad_agent.send_sign('27')
        mes = "set air con to 27 degree"
    elif command == 'set_26_degree':
        broad_agent.send_sign('26')
        mes = "set air con to 26 degree"
    elif command == 'set_25_degree':
        broad_agent.send_sign('25')
        mes = "set air con to 25 degree"
    elif command == 'turn_aircon_off':
        broad_agent.send_sign('off')
        mes = "turn off the air condition"
    else :
        mes = "no_op"

    print(f"command is : {command}")

    return jsonify({'device status' : mes}) , 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 5000)



