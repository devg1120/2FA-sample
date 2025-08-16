console.log("✅ webauthn-helpers.js loaded");

function base64URLToBuffer(base64URL) {
  const padding = '='.repeat((4 - base64URL.length % 4) % 4);
  const base64 = (base64URL + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output.buffer;
}

function bufferToBase64URL(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function credentialToJSON(cred) {
  if (!cred) return null;
  return {
    id: cred.id,
    rawId: bufferToBase64URL(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: bufferToBase64URL(cred.response.clientDataJSON),
      attestationObject: cred.response.attestationObject ? bufferToBase64URL(cred.response.attestationObject) : undefined,
      authenticatorData: cred.response.authenticatorData ? bufferToBase64URL(cred.response.authenticatorData) : undefined,
      signature: cred.response.signature ? bufferToBase64URL(cred.response.signature) : undefined,
      userHandle: cred.response.userHandle ? bufferToBase64URL(cred.response.userHandle) : null,
    }
  };
}