from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
import os
import binascii
import base64
import json
from flask import session

current_directory = os.path.dirname(os.path.abspath(__file__))
KEYS_DIRECTORY = os.path.join(current_directory, '../keys')

SERVER_PUBLIC_KEY = ''
with open('../keys/server-public.pem', 'rb') as f:
    SERVER_PUBLIC_KEY = f.read()
    f.close()

def getPrivateKey(username, password):
    pem_file_path = os.path.join(KEYS_DIRECTORY, f"{username}-private.pem")
    with open(pem_file_path, "rb") as pem_file:
        pem_data = pem_file.read()
        pem_file.close()
    
    private_key = serialization.load_pem_private_key(
        pem_data,
        password=password.encode(),
        backend=default_backend()
    )

    return private_key

def dumpJSON(str):
    # Server JSON.stringify() (javascript) doesn't include spaces
    return json.dumps(str).replace(' ', '').encode()

def encrypt_aes(payload, key):
    iv = os.urandom(16)    

    # Create cipher object
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Encrypt and get the authentication tag
    ct = encryptor.update(payload) + encryptor.finalize()
    tag = encryptor.tag

    # Convert binary data to hexadecimal strings
    return {
        'iv': binascii.hexlify(iv).decode('utf-8'),
        'payload': binascii.hexlify(ct).decode('utf-8'),
        'tag': binascii.hexlify(tag).decode('utf-8')
    }

def decrypt_aes(ciphertext, key):
    # Convert hexadecimal strings back to binary data
    iv = binascii.unhexlify(ciphertext['iv'])
    ct = binascii.unhexlify(ciphertext['payload'])
    tag = binascii.unhexlify(ciphertext['tag'])

    # Create cipher object
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()

    # Decrypt the ciphertext
    return decryptor.update(ct) + decryptor.finalize()

def encrypt_rsa(data, publicKey):
    # Load the public key
    public_key = serialization.load_pem_public_key(
        publicKey,
        backend=default_backend()
    )

    # Encrypt the data
    encrypted_data = public_key.encrypt(
        data,
        padding.PKCS1v15()
    )
    # Encode the encrypted data to base64
    return base64.b64encode(encrypted_data).decode('utf-8')

def decrypt_rsa(encrypted_data, private_key):
    # Decode the encrypted data from base64
    encrypted_data_bytes = base64.b64decode(encrypted_data.encode())

    # Decrypt the data
    return private_key.decrypt(
        encrypted_data_bytes,
        padding.PKCS1v15()
    )

def sign(data, private_key):
    # Private key already serialized and loaded
    signature = private_key.sign(
        dumpJSON(data),
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode()

def verify_sign(value, signature, publicKey):
    # Load the public key
    public_key = serialization.load_pem_public_key(
        publicKey,
        backend=default_backend()
    )

    # Verify the signature
    public_key.verify(
        base64.b64decode(signature),
        dumpJSON(value),
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    # Throws except InvalidSignature if false

#def create_nonce(username, value):
#    filename = 'nonce_' + username
#    with open(filename, 'w') as f:
#        f.write(str(value))   

def init_nonce():
    try:
        with open('nonce_' + session['username'], 'r') as f: 
            nonce = int(f.read())
            session['nonce'] = nonce if nonce else 1
    except:
        session['nonce'] = 1

def set_nonce(val):
    filename = 'nonce_' + session['username']
    session['nonce'] = val
    with open(filename, 'w') as f: 
            f.write(str(session['nonce']))

def file_key(username, public_key):
    filename = username + "_publickey"
    with open('./publickeys/' + filename, 'w') as f:
        f.write(str(public_key))


