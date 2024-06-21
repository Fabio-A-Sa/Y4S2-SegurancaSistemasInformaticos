from flask import render_template, request, session
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import requests
from utils import encrypt_aes, decrypt_aes, verify_sign, sign, dumpJSON, SERVER_PUBLIC_KEY, set_nonce, file_key, encrypt_rsa, decrypt_rsa
import json
import time
import os

def chat_page():
    return render_template('chat.html')

def chat_setup_api():

    try:

        if not session['id']: return render_template('login.html')

        PRIVATE_KEY = serialization.load_pem_private_key(
            session['private'].encode(), 
            password=None,
            backend=default_backend()
        )

        otherUser = request.form['name']

        print('Ask server about user: ' + otherUser)

        op = "CHAT"
        message = encrypt_aes(dumpJSON({'message': {'op': op, 'username': otherUser}, 'nonce': session['nonce']}), session['key'])
        signature = sign(message, PRIVATE_KEY)
        response = requests.post('http://localhost:3000/chat', json={'sessionID': session['id'], 'message': message, 'signature': signature})
        set_nonce(session['nonce'] + 1)

        # print(response)
        data = response.json()
        if 'error' in data:
            raise ValueError(data['error'])
            
        verify_sign(data['message'], data['signature'], SERVER_PUBLIC_KEY)

        print('Signature OK.')

        value = json.loads(decrypt_aes(data['message'], session['key']))

        print('Decrypted message: ' + str(value))

        file_key(value['username'], value['public_key'])

        return render_template('chat.html', user=value, status={'code': 'success'})
    except Exception as e:
        return render_template('chat.html', status={'code': 'error', 'message': str(e)})

def chat_sendmessage():
    otherUser = request.form['otherUser']
    port = request.form['port']
    msg = request.form['msg']

    PRIVATE_KEY = serialization.load_pem_private_key(
        session['private'].encode(), 
        password=None,
        backend=default_backend()
    )

    with open(f'./publickeys/{otherUser}_publickey', 'r') as f:
        upk = f.read().encode()

    print('Sending message to port ' + port)

    message = encrypt_rsa(dumpJSON({'message': msg, 'username': otherUser, 'nonce': session['nonce']}), upk)
    signature = sign(message, PRIVATE_KEY)
    requests.post('http://localhost:' + port +'/receivemessage', json={'username': session['username'], 'message': message, 'signature': signature})
    set_nonce(session['nonce'] + 1)

    return render_template('success.html', status={'code': 'success'})

def chat_receivemessage():
    print('Received message, saving it locally...')

    req = request.get_json()

    with open(f'./messages/{int(time.time())}', 'w') as f:
        f.write(json.dumps(req))

    return '', 200

def chat_listmessages():
    PRIVATE_KEY = serialization.load_pem_private_key(
        session['private'].encode(), 
        password=None,
        backend=default_backend()
    )

    public_keys = {}
    for file in os.listdir(os.fsencode('./publickeys')):
        filename = os.fsdecode(file)
        with open('./publickeys/' + filename, 'r') as f:
            public_keys[filename.split('_')[0]] = f.read().encode()

    messages = []
    for file in os.listdir(os.fsencode('./messages')):
        filename = os.fsdecode(file)
        with open('./messages/' + filename, 'r') as f:
            content = f.read()
            data = json.loads(content)

            username = data['username']
            if not username in public_keys:
                op = "CHAT"
                message = encrypt_aes(dumpJSON({'message': {'op': op, 'username': username}, 'nonce': session['nonce']}), session['key'])
                signature = sign(message, PRIVATE_KEY)
                response = requests.post('http://localhost:3000/chat', json={'sessionID': session['id'], 'message': message, 'signature': signature})
                set_nonce(session['nonce'] + 1)

                data = response.json()
                if 'error' in data:
                    raise ValueError(data['error'])
                    
                verify_sign(data['message'], data['signature'], SERVER_PUBLIC_KEY)

                value = json.loads(decrypt_aes(data['message'], session['key']))
                public_keys[value['username']] = value['public_key'].encode()
                file_key(value['username'], value['public_key'])

            verify_sign(data['message'], data['signature'], public_keys[username])
            message = json.loads(decrypt_rsa(data['message'], PRIVATE_KEY))
            messages.append({'user': data['username'], 'message': message['message']})

    return messages