document.addEventListener("DOMContentLoaded", () => {
    const email = sessionStorage.getItem("email");
    const userInfoDiv = document.getElementById("userInfo");
    if (userInfoDiv && email) userInfoDiv.innerText = `Logged in as: ${email}`;
  
    const registerBtn = document.getElementById("createPasskeyBtn");
    const passkeyInput = document.getElementById("passkeyName");
  
    if (!email) {
      alert("No email found. Please start from the main page.");
      return;
    }
  
    registerBtn.addEventListener("click", async () => {
      try {
        const passkeyName = passkeyInput?.value.trim();
        if (!passkeyName) return alert("Please enter a name for your passkey!");
  
        const res = await fetch("/register/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, passkeyName })
        });
  
        const options = await res.json();
        if (!options.challenge) throw new Error("Invalid registration options");
  
        console.log("📡 Registration options:", options);
  
        const base64ToArrayBuffer = (b64) => {
          const binary = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
          const buffer = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
          return buffer.buffer;
        };
  
        const publicKey = {
          challenge: base64ToArrayBuffer(options.challenge),
          rp: options.rp,
          user: {
            id: base64ToArrayBuffer(options.user.id),
            name: options.user.name,
            displayName: options.user.displayName
          },
          pubKeyCredParams: options.pubKeyCredParams,
          authenticatorSelection: options.authenticatorSelection,
          attestation: "none",
          timeout: options.timeout
        };
  
        const credential = await navigator.credentials.create({ publicKey });
        if (!credential) throw new Error("Credential creation failed");
  
        console.log("✅ Credential created:", credential);
  
        const finishRes = await fetch("/register/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            credential: {
              id: credential.id,
              name: passkeyName,
              provider: "Detected via Browser",
              aaguid: credential.clientExtensionResults?.aaguid || "Unknown",
              deviceType: "multiDevice",
              backupState: false
            }
          })
        });
  
        const result = await finishRes.json();
        if (result.success) {
          alert("✅ Passkey registered successfully!");
          window.location.href = "/login.html";
        } else {
          throw new Error("Registration failed on server");
        }
      } catch (err) {
        console.error("❌ Registration Error:", err);
        alert(`Registration Error: ${err.message}`);
      }
    });
  });