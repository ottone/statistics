// decrypt.js — RSA decryption module

document.addEventListener("DOMContentLoaded", () => {

  const pInput = document.getElementById("decP");
  const qInput = document.getElementById("decQ");
  const eInput = document.getElementById("decE");
  const decryptBtn = document.getElementById("decryptBtn");
  const outputBox = document.getElementById("decryptedOutput");

  if (!decryptBtn) return;

  // funzioni matematiche di supporto
  function egcd(a, b) {
    if (b === 0n) return { g: a, x: 1n, y: 0n };
    const r = egcd(b, a % b);
    return { g: r.g, x: r.y, y: r.x - (a / b) * r.y };
  }

  function modInv(a, m) {
    const { g, x } = egcd(a, m);
    if (g !== 1n && g !== -1n) return null;
    return (x % m + m) % m;
  }

  function modExp(base, exp, mod) {
    let result = 1n;
    let b = BigInt(base) % BigInt(mod);
    let e = BigInt(exp);

    while (e > 0n) {
      if (e & 1n) result = (result * b) % BigInt(mod);
      b = (b * b) % BigInt(mod);
      e >>= 1n;
    }
    return Number(result);
  }

  decryptBtn.addEventListener("click", () => {

    const p = Number(pInput.value);
    const q = Number(qInput.value);
    const e = Number(eInput.value);

    if (!p || !q || !e) {
      alert("Insert p, q and e first.");
      return;
    }

    const N = p * q;
    const phi = (p - 1) * (q - 1);

    const dBig = modInv(BigInt(e), BigInt(phi));
    if (!dBig) {
      alert("Invalid parameters: modular inverse does not exist.");
      return;
    }
    const d = Number(dBig);

    if (!window.secretCipherTokens || !window.reverseMapping) {
      alert("Ciphertext or mapping not found.");
      return;
    }

    // decodifica token
    let decrypted = "";
    window.secretCipherTokens.forEach(C => {
      const M = modExp(C, d, N);
      decrypted += window.reverseMapping[String(M)] || "?";
    });

    outputBox.textContent = decrypted;
  });

});
