//import { DatabaseSync } from "node:sqlite";
//const database = new DatabaseSync("./db.sqlite");

import sqlite from "sqlite3";
const database = new sqlite.Database("./db.sqlite");


database.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);

CREATE TABLE passkeys (
  credential_id TEXT PRIMARY KEY,
  webauthn_user_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  device_type TEXT NOT NULL,
  counter INTEGER NOT NULL,
  backup boolean NOT NULL,
  transports TEXT NOT NULL,

  user_id INTEGER NOT NULL,
  foreign key (user_id) references users(id)
);
`);
