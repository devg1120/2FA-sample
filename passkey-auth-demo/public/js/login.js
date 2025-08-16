document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const email = sessionStorage.getItem("email");

    const userInfoDiv = document.getElementById("userInfo");
if (userInfoDiv && email) userInfoDiv.innerText = `You are logging in as: ${email}`;
  
    if (!email) {
      alert("No email found. Please start from the main page.");
      return;
    }
  
    loginBtn.addEventListener("click", async () => {
      try {
        // ✅ Step 1: Ask server for login challenge
        const res = await fetch("/login/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
  
        if (!res.ok) throw new Error("Failed to get login challenge");
        const options = await res.json();
        if (!options.challenge) throw new Error("No challenge received");
  
        console.log("📡 Login options:", options);
  
        // ✅ Helper: Convert base64url → ArrayBuffer
        const base64ToArrayBuffer = (base64) => {
          const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
          const buffer = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
          return buffer.buffer;
        };
  
        // ✅ Prepare WebAuthn request
        const publicKey = {
          challenge: base64ToArrayBuffer(options.challenge),
          allowCredentials: options.allowCredentials.map(cred => ({
            id: base64ToArrayBuffer(cred.id),
            type: "public-key"
          })),
          userVerification: "preferred"
        };
  
        // ✅ Step 2: Call WebAuthn API
        const assertion = await navigator.credentials.get({ publicKey });
        if (!assertion) throw new Error("No assertion returned");
  
        console.log("✅ Assertion:", assertion);
  
        // ✅ Step 3: Send to server for verification
        const verifyRes = await fetch("/login/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            credentialID: assertion.id,
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON)))
          })
        });
  
        const result = await verifyRes.json();
        if (result.success) {
          alert("✅ Login successful!");
          window.location.href = "/manage-passkeys.html";
        } else {
          throw new Error("Login verification failed");
        }
      } catch (err) {
        console.error("❌ Login Error:", err);
        alert(`Login failed: ${err.message}`);
      }
    });
  });