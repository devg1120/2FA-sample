CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE, credential_id BLOB, public_key BLOB, counter INTEGER);
