# 🔐 Passkey Authentication Demo

This project is a **Passkey Authentication Web App** built from scratch to learn WebAuthn (FIDO2) concepts.  
It allows users to:

- ✅ Register using their email + OTP verification.
- ✅ Create multiple passkeys (saved in iCloud, Google Password Manager, or browser password store).
- ✅ Log in using existing passkeys.
- ✅ Manage all registered passkeys via a management dashboard.
- ✅ Detect and mark the **most recently used** passkey.

---

## 🏗 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js with Express
- **WebAuthn:** No external library for passkey logic (lightweight implementation)
- **OTP:** Console-based OTP verification
- **Storage:** In-memory (for demo)

---

## 🚀 Features

1. **Email → OTP → Passkey Flow**

   - Verifies the user via OTP before allowing passkey registration.

2. **Passkey Registration**

   - Allows naming of passkeys.
   - Supports multiple passkeys per account.

3. **Passkey Login**

   - Uses WebAuthn API to authenticate securely.

4. **Manage Passkeys**
   - Lists all registered passkeys in a table.
   - Shows provider, device type, backup status, last used, etc.
   - Marks the most recently used passkey ✅.

---

## 🖥️ How to Run Locally

```bash
git clone https://github.com/your-username/passkey-auth-demo.git
cd passkey-auth-demo
npm install
node server.js
```
