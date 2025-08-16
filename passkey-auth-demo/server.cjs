const express = require("express");
const bodyParser = require("body-parser");
const base64url = require("base64url");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = 3000;

// ✅ In-memory storage
const users = {};
const otps = {};

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


// ✅ Serve HTML Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/otp.html", (req, res) => res.sendFile(path.join(__dirname, "public/otp.html")));
app.get("/register.html", (req, res) => res.sendFile(path.join(__dirname, "public/register.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "public/login.html")));
app.get("/manage-passkeys.html", (req, res) => res.sendFile(path.join(__dirname, "public/manage-passkeys.html")));


// ✅ 1. Check if user is registered
app.post("/check-user", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const exists = users[email] && users[email].passkeys && users[email].passkeys.length > 0;
  res.json({ registered: exists });
});


// ✅ 2. Send OTP (simulated)
app.post("/send-otp", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = otp;

  console.log(`📧 OTP for ${email}: ${otp}`);
  res.json({ success: true });
});


// ✅ 3. Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otps[email] && otps[email] === otp) {
    delete otps[email]; // OTP used
    if (!users[email]) users[email] = { email, passkeys: [] };
    return res.json({ success: true });
  }
  res.json({ success: false });
});


// ✅ 4. Register Passkey - Start
app.post("/register/start", (req, res) => {
  const { email, passkeyName } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  if (!users[email]) users[email] = { email, passkeys: [] };

  const challenge = base64url(crypto.randomBytes(32));
  const userID = crypto.randomBytes(16);

  users[email].pendingRegistration = { challenge, passkeyName };

  res.json({
    challenge,
    rp: { name: "Passkey Demo", id: "localhost" },
    user: {
      id: userID.toString("base64"),
      name: email,
      displayName: email
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 }
    ],
    authenticatorSelection: { userVerification: "preferred" },
    timeout: 60000,
    attestation: "none"
  });
});


// ✅ 5. Register Passkey - Finish
app.post("/register/finish", (req, res) => {
  const { email, credential } = req.body;
  if (!email || !credential) return res.status(400).json({ error: "Invalid data" });

  const pending = users[email].pendingRegistration;
  if (!pending) return res.status(400).json({ error: "No pending registration" });

  // ✅ Save credential
  const newPasskey = {
    name: credential.name || "Unnamed",
    credentialID: credential.id,
    provider: credential.provider || "Unknown",
    aaguid: credential.aaguid || "Unknown",
    deviceType: credential.deviceType || "Unknown",
    backupState: credential.backupState || false,
    lastUsed: new Date().toISOString()
  };

  users[email].passkeys.push(newPasskey);
  delete users[email].pendingRegistration;

  console.log(`✅ Registered new passkey for ${email}: ${newPasskey.credentialID}`);
  res.json({ success: true });
});


// ✅ 6. Login Start
app.post("/login/start", (req, res) => {
  const { email } = req.body;
  if (!email || !users[email] || users[email].passkeys.length === 0) {
    return res.status(400).json({ error: "No registered passkeys" });
  }

  const challenge = base64url(crypto.randomBytes(32));
  users[email].pendingLogin = { challenge };

  res.json({
    challenge,
    allowCredentials: users[email].passkeys.map(pk => ({
      id: pk.credentialID,
      type: "public-key"
    }))
  });
});


// ✅ 7. Login Finish
app.post("/login/finish", (req, res) => {
  const { email } = req.body;
  if (!users[email]) return res.status(400).json({ error: "User not found" });

  // ✅ Mark last used
  if (users[email].passkeys.length > 0) {
    users[email].passkeys[users[email].passkeys.length - 1].lastUsed = new Date().toISOString();
  }

  delete users[email].pendingLogin;
  res.json({ success: true });
});


// ✅ 8. Manage Passkeys Endpoint
app.get("/user-passkeys", (req, res) => {
  const { email } = req.query;
  if (!email || !users[email]) {
    return res.json({ passkeys: [] });
  }

  res.json({
    passkeys: users[email].passkeys.map(pk => ({
      name: pk.name,
      credentialID: pk.credentialID,
      provider: pk.provider,
      aaguid: pk.aaguid,
      deviceType: pk.deviceType,
      backupState: pk.backupState,
      lastUsed: pk.lastUsed
    }))
  });
});


// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));