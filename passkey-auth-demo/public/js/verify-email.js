const params = new URLSearchParams(window.location.search);
const email = params.get('email');

(async () => {
  await fetch('/send-otp', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email })
  });
  alert('OTP sent! Check server console.');
})();

document.getElementById('verifyBtn').addEventListener('click', async () => {
  const otp = document.getElementById('otp').value.trim();
  const res = await fetch('/verify-otp', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (data.verified) {
    window.location.href = `/register.html?email=${encodeURIComponent(email)}`;
  } else {
    alert('Invalid OTP');
  }
});