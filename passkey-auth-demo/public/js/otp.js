document.addEventListener("DOMContentLoaded", () => {
    const email = sessionStorage.getItem("email");
    if (!email) return alert("No email found! Start from home page.");
  
    const otpInput = document.getElementById("otpInput");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  
    verifyOtpBtn.addEventListener("click", async () => {
      const otp = otpInput.value.trim();
      if (!otp) return alert("Enter OTP!");
  
      const res = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
  
      const result = await res.json();
      if (result.success) {
        alert("✅ OTP Verified!");
        window.location.href = "/register.html";
      } else {
        alert("❌ Invalid OTP. Try again.");
      }
    });
  });