PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS user;
CREATE TABLE user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    one_time_id TEXT,
    username TEXT,
    security_level INTEGER,
    public_key TEXT,
    port INTEGER,
    session_id TEXT,
    session_key TEXT,
    status INTEGER DEFAULT 0,
    nonce INTEGER,
    UNIQUE(username),
    UNIQUE(full_name, one_time_id)
);
