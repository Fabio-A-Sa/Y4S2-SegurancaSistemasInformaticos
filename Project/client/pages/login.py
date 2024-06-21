from flask import render_template, request, redirect, url_for, session
import requests
from db import db
from utils import verify_sign, sign, dumpJSON, getPrivateKey, SERVER_PUBLIC_KEY, encrypt_rsa, decrypt_rsa, set_nonce
import json

def login_page():
    return render_template('login.html')

def login_api():
    username = request.form['username']
    password = request.form['password']

    try:
        # First step - Local authentication
        success = db.verify_password(username, password)

        if not success:
            return render_template('login.html', status={'code': 'error', 'message': 'Wrong username or password'})


        # Second step - Remote authentication
        PRIVATE_KEY = getPrivateKey(username, password) 

        message = encrypt_rsa(dumpJSON({'message': 'LOGIN', 'port': request.host.split(':')[1], 'nonce': session['nonce']}), SERVER_PUBLIC_KEY)
        signature = sign(message, PRIVATE_KEY)
        response = requests.post('http://localhost:3000/login', json={'username': username, 'message': dumpJSON(message), 'signature': signature})
        set_nonce(session['nonce'] + 1)
        
        data = response.json()
        if 'error' in data:
            raise ValueError(data['error'])
        
        print(f'Response from server: {data}')
        
        verify_sign(data['message'], data['signature'], SERVER_PUBLIC_KEY)

        print('Signature OK.')

        session_data = json.loads(decrypt_rsa(data['message'], PRIVATE_KEY))
        print(f'Decrypted message: {session_data}')
        session['username'] = username
        session['id'] = session_data['sessionID']
        session['key'] = session_data['sessionKey'].encode('ascii')
        session['security_level'] = session_data['securityLevel']
    
        return redirect(url_for('routes.home'))
    except Exception as e:
        return render_template('login.html', status={'code': 'error', 'message': f"Exception: {str(e)}"})