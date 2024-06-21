from flask import render_template, request, redirect, url_for, session
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import requests
import json
from utils import encrypt_aes, decrypt_aes, verify_sign, sign, dumpJSON, SERVER_PUBLIC_KEY, set_nonce
from db import db

def register_page():
    return render_template('register.html')

def register_api():
    username = request.form['username']
    onetimeid = request.form['onetimeid']
    password = request.form['password']

    message = encrypt_aes(b'REGISTER', onetimeid.encode('ascii'))
    response = requests.post('http://localhost:3000/register', json={'username': username, 'message': message})

    if response and response.status_code == 200:
        try:    
            body = response.json()

            print(f'Response from server: {body}')

            # Check server signature
            verify_sign(body['message'], body['signature'], SERVER_PUBLIC_KEY)

            print('Signature OK.')

            # Decrypt data
            data = json.loads(decrypt_aes(body['message'], onetimeid.encode('ascii')))

            print(f'Decrypted message: {data}')
            session['username'] = username
            session['key'] = data['sessionKey'].encode('ascii')
            session['id'] = data['sessionID']
            set_nonce(data['nonce'] + 1)
            session['security_level'] = data['security_level']
            
            PRIVATE_KEY = serialization.load_pem_private_key(
                data['privateKey'].encode(), 
                password=None,
                backend=default_backend()
            )

            session['private'] = data['privateKey']

            # Encrypt the private key and save it
            pem_format = PRIVATE_KEY.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.BestAvailableEncryption(password.encode())
            )
    
            print('Saving private key encrypted...')

            with open(f"../keys/{username}-private.pem", "wb") as pem_file:
                pem_file.write(pem_format)
                pem_file.close()

            # Save user data
            db.add_user(username, password, 3, None, None, None)

            print('Sending this information encrypted and signed:')
            print({'message': 'REGISTER_ACK', 'nonce': session['nonce']})

            # Send ACK message
            message = encrypt_aes(dumpJSON({'message': 'REGISTER_ACK', 'port': request.host.split(':')[1], 'nonce': session['nonce']}), session['key'])
            signature = sign(message, PRIVATE_KEY)
            requests.post('http://localhost:3000/registerack', json={'sessionID': session['id'], 'message': message, 'signature': signature})
            set_nonce(session['nonce'] + 1)

            return redirect(url_for('routes.home'))
        except Exception as e:
            return render_template('register.html', status={'code': 'error', 'message': str(e)}, response=response)
    else:
        return render_template('register.html', status={'code': 'error', 'message': 'Invalid register data!'}, response=response.json())