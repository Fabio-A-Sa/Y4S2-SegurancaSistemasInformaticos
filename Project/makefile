.PHONY: server client

server:
	cd server && npm install
	cd server && node index.js

client:
	cd client && python3 -m pip install -r requirements.txt
	cd client && python3 app.py 3001 