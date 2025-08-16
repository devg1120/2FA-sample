document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailInput");
    const continueBtn = document.getElementById("continueBtn");
  
    continueBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      if (!email) return alert("Enter your email!");
  
      const res = await fetch("/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
  
      const result = await res.json();
      sessionStorage.setItem("email", email);
  
      if (result.registered) {
        // User already has passkeys → login directly
        window.location.href = "/login.html";
      } else {
        // New user → send OTP first
        await fetch("/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        alert("📧 OTP sent! Check server console.");
        window.location.href = "/otp.html";
      }
    });
  });