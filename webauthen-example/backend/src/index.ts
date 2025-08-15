import { serve } from "@hono/node-server";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
  type CredentialDeviceType,
} from "@simplewebauthn/server";
import { Hono } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { cors } from "hono/cors";
//import { DatabaseSync } from "node:sqlite";
//const database = new DatabaseSync("./db.sqlite");
import sqlite from "sqlite3";
const database = new sqlite.Database("./db.sqlite");

type Passkey = {
  id: Base64URLString;
  publicKey: Uint8Array;
  username: string;
  webauthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports: AuthenticatorTransportFuture[];
};

function getUserPasskeys(username: string): readonly Passkey[] {
  const dbPasskeys = database
    .prepare(
      "SELECT * from passkeys join users on passkeys.user_id = users.id where users.username = ?"
    )
    .all(username);

  const passkeys: readonly Passkey[] = dbPasskeys.map((passkey) => ({
    id: passkey.credential_id,
    publicKey: passkey.public_key,
    username: passkey.username,
    webauthnUserID: passkey.webauthn_user_id,
    counter: passkey.counter,
    deviceType: passkey.device_type,
    backedUp: passkey.backup === 1,
    transports: passkey.transports.split(","),
  }));

  return passkeys;
}

const app = new Hono();
app.use(
  "*",
  cors({
    //origin: "http://localhost:3001",
    origin: "http://localhost:8000",
    credentials: true,
  })
);
const secret = "secret";

app.get("/register-request", async (c) => {

  console.log("/register-request");
  const username = c.req.query("username");

  if (!username) {
    return c.json({ error: "Username is required" }, 400);
  }

  //const passkeys = getUserPasskeys(username);

  const option = await generateRegistrationOptions({
    rpID: "localhost",
    rpName: "Example RP",
    userName: username,
    timeout: 60000,
    //excludeCredentials: passkeys.map((passkey) => ({
    //  id: passkey.id,
   //   transports: passkey.transports,
  //  })),
    authenticatorSelection: {
      userVerification: "preferred",
    },
  });

  await setSignedCookie(c, "challenge", option.challenge, secret);

  return c.json(option);
});

app.post("/register-response", async (c) => {
  console.log("/register-response");
  const body = await c.req.json();
  const { response, username, userId } = body;
  const { challenge } = await getSignedCookie(c, secret);

  if (!challenge) {

	  console.log("Challenge not found");
    return c.json({ error: "Challenge not found" }, 400);
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: "http://localhost:8000",
    expectedRPID: "localhost",
    requireUserVerification: false,
  });

  if (!verification.verified) {
	  console.log("Verification failed");
    return c.json({ error: "Verification failed" }, 400);
  }

  const { registrationInfo } = verification;

  const user = database
    .prepare("INSERT INTO users (username) VALUES (?)")
    .run(username);
  database
    .prepare(
      "INSERT INTO passkeys (user_id, credential_id, public_key, webauthn_user_id, counter, device_type, backup, transports) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      user.lastInsertRowid,
      registrationInfo?.credential.id,
      registrationInfo?.credential.publicKey,
      userId,
      registrationInfo?.credential.counter,
      registrationInfo?.credentialDeviceType,
      registrationInfo?.credentialBackedUp ? 1 : 0,
      registrationInfo?.credential.transports?.join(",") ?? ""
    );

  return c.json({ success: true });
});

app.get("/signin-request", async (c) => {
  const option = await generateAuthenticationOptions({
    rpID: "localhost",
    timeout: 60000,
    allowCredentials: [],
    userVerification: "preferred",
  });

  await setSignedCookie(c, "challenge", option.challenge, secret);

  return c.json(option);
});

function findPasskeyByCredentialId(
  credentialId: Base64URLString
): Passkey | null {
  const passkey = database
    .prepare(
      "SELECT * from passkeys join users on passkeys.user_id = users.id where passkeys.credential_id = ?"
    )
    .get(credentialId);

  if (!passkey) {
    return null;
  }

  return {
    id: passkey.credential_id,
    publicKey: passkey.public_key,
    username: passkey.username,
    webauthnUserID: passkey.webauthn_user_id,
    counter: passkey.counter,
    deviceType: passkey.device_type,
    backedUp: passkey.backup === 1,
    transports: passkey.transports.split(","),
  };
}

function updatePasskeyCounter(credentialId: Base64URLString, counter: number) {
  database
    .prepare("UPDATE passkeys set counter = ? where credential_id = ?")
    .run(counter, credentialId);
}

app.post("/signin-response", async (c) => {
  const body = await c.req.json();
  const { challenge } = await getSignedCookie(c, secret);

  if (!challenge) {
    return c.json({ error: "Challenge not found" }, 400);
  }

  const passkey = findPasskeyByCredentialId(body.id);

  if (!passkey) {
    return c.json({ error: "Passkey not found" }, 400);
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: "http://localhost:3001",
    expectedRPID: "localhost",
    credential: {
      counter: passkey.counter,
      id: passkey.id,
      publicKey: passkey.publicKey,
      transports: passkey.transports,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    return c.json({ error: "Verification failed" }, 400);
  }

  updatePasskeyCounter(passkey.id, verification.authenticationInfo.newCounter);

  return c.json({ success: true });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
