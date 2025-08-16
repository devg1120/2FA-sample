document.addEventListener("DOMContentLoaded", async () => {
  const email = sessionStorage.getItem("email");
  if (!email) return alert("No logged in user!");

  document.getElementById("userInfo").innerText = `You are logged in as: ${email}`;

  try {
    const res = await fetch(`/user-passkeys?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    const tbody = document.querySelector("#passkeyTable tbody");
    tbody.innerHTML = "";

    if (!data.passkeys || data.passkeys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No registered passkeys</td></tr>`;
      return;
    }

    data.passkeys.forEach(pk => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pk.name || "-"}</td>
        <td>${pk.credentialID || "-"}</td>
        <td>${pk.provider || "Unknown"}</td>
        <td>${pk.aaguid || "Unknown"}</td>
        <td>${pk.deviceType || "Unknown"}</td>
        <td>${pk.backupState ? "Yes" : "No"}</td>
        <td>${pk.lastUsed || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Error loading passkeys:", err);
    alert("Failed to load passkeys");
  }
});