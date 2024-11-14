from flask import Flask, request
from coustum_boardlink import BoardDevice

app = Flask(__name__)

broad_agent = BroadDevice()

# LED_PIN = 17
# GPIO.setmode(GPIO.BCM)
# GPIO.setup(LED_PIN, GPIO.OUT)

@app.route('/control-device', method=["POST"])

def control_device():
    command = request.json.get('command')
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
