from flask import render_template, request, session
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import requests
from utils import encrypt_aes, decrypt_aes, verify_sign, sign, dumpJSON, SERVER_PUBLIC_KEY, set_nonce
import json

def users_page():
    return render_template('users.html')

def users_api():

    try:

        if not session['id']: render_template('login.html')

        PRIVATE_KEY = serialization.load_pem_private_key(
            session['private'].encode(), 
            password=None,
            backend=default_backend()
        )
        

        message = encrypt_aes(dumpJSON({'message': 'USERS', 'nonce': session['nonce']}), session['key'])
        signature = sign(message, PRIVATE_KEY)
        response = requests.post('http://localhost:3000/users', json={'sessionID': session['id'], 'message': message, 'signature': signature})
        set_nonce(session['nonce'] + 1)

        data = response.json()
        if 'error' in data:
            raise ValueError(data['error'])
        
        verify_sign(data['message'], data['signature'], SERVER_PUBLIC_KEY)
        
        result = json.loads(decrypt_aes(data['message'], session['key']))

        return render_template('users.html', users=result['users'], status={'code': 'success', 'message': 'Login successfully!'})
    except Exception as e:
        return render_template('login.html', status={'code': 'error', 'message': f"Exception: {str(e)}"})