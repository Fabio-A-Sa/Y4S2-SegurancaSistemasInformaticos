from flask import Flask
from flask_session import Session

from routes import register_routes
import sys

app = Flask(__name__)
app.secret_key = 'jmcruz'
app.config["SESSION_PERMANENT"] = False
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)

register_routes(app)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python app.py <PORT>")
        sys.exit(1)

    port = int(sys.argv[1])
    app.run(port=port, debug=True)
