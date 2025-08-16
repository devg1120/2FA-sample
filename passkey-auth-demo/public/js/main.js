document.getElementById('continueBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) return alert("Enter a valid email");
  
    const res = await fetch('/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  
    const { exists } = await res.json();
    if (exists) {
      window.location.href = `/login.html?email=${encodeURIComponent(email)}`;
    } else {
      await fetch('/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert(`OTP sent to ${email}`);
      window.location.href = `/otp.html?email=${encodeURIComponent(email)}`;
    }
  });