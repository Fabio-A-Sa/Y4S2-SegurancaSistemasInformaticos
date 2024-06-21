from flask import request, render_template, session
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import requests
import json
from utils import encrypt_aes, decrypt_aes, verify_sign, sign, dumpJSON, SERVER_PUBLIC_KEY, set_nonce

def service_api(op):
    value = request.form['value']

    msg = {'op': op, 'value': value}
    if op == 'NROOT':
        msg['root'] = request.form['root']

    try:
        PRIVATE_KEY = serialization.load_pem_private_key(
            session['private'].encode(), 
            password=None,
            backend=default_backend()
        )

        message = encrypt_aes(dumpJSON({'message': msg, 'nonce': session['nonce']}), session['key'])
        signature = sign(message, PRIVATE_KEY)
        response = requests.post('http://localhost:3000/operation', json={'sessionID': session['id'], 'message': message, 'signature': signature})
        set_nonce(session['nonce'] + 1)

        data = response.json()
        print(f'Response from server: {data}')
        if 'error' in data:
            raise ValueError(data['error'])

        verify_sign(data['message'], data['signature'], SERVER_PUBLIC_KEY)

        print('Signature OK.')

        value = json.loads(decrypt_aes(data['message'], session['key']))
        print(f'Decrypted message: {value}')
        return render_template('result.html', status={'code': 'success'}, response=value)
    except Exception as e:
        return render_template('result.html', status={'code': 'error', 'message': str(e)})