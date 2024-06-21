import sqlite3
import os
import hashlib
import secrets

current_directory = os.path.dirname(os.path.abspath(__file__))
DATABASE_NAME = os.path.join(current_directory, 'database.db')
SCHEMA_FILE = os.path.join(current_directory, 'schema.sql')

def initialize_database():
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()

    with open(SCHEMA_FILE, 'r') as schema_file:
        schema_sql = schema_file.read()
    
    c.executescript(schema_sql)
    conn.commit()
    conn.close()

def add_user(username, password, security_level, nonce, session_key, session_id):
    if not username_exists(username):
        conn = sqlite3.connect(DATABASE_NAME)
        c = conn.cursor()
        salt = secrets.token_hex(16)
        
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        c.execute("INSERT INTO users (username, password_hash, salt, security_level, nonce, session_key, session_id) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            (username, password_hash, salt, security_level, nonce, session_key, session_id))
        
        conn.commit()
        conn.close()

def save_session(username, NONCE, SESSION_KEY, SESSION_ID):
    if username_exists(username):
        conn = sqlite3.connect(DATABASE_NAME)
        c = conn.cursor()
        c.execute(
            "UPDATE users SET nonce=?, session_key=?, session_id=? WHERE username=?",
            (NONCE, SESSION_KEY, SESSION_ID, username)
        )
        conn.commit()
        conn.close()

def username_exists(username):
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=?", (username,))
    result = c.fetchone()
    conn.close()
    return result is not None

def verify_password(username, password):
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("SELECT password_hash, salt FROM users WHERE username=?", (username,))
    result = c.fetchone()
    conn.close()
    
    if result:
        saved_password_hash, salt = result
        entered_password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return entered_password_hash == saved_password_hash

    return False

def getSessionInfo(username):
    if username_exists(username):
        conn = sqlite3.connect(DATABASE_NAME)
        c = conn.cursor()
        c.execute("SELECT nonce, session_key, session_id FROM users WHERE username=?", (username,))
        result = c.fetchone()
        conn.close()
        if result:
            nonce, session_key, session_id = result
            return {"nonce": nonce, "session_key": session_key, "session_id": session_id}
    return None

initialize_database()