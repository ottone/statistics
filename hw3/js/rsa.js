// rsa1.js — pulito e funzionante

// === Parametri RSA didattici (per generare i token) ===
const N = 221;
const eDefault = 11;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

// === Riferimenti DOM ===
const plainAnalysis = document.getElementById("plainAnalysis");
const decodedSection = document.getElementById("decodedSection");
const decodedText = document.getElementById("decodedText");

const selectE = document.getElementById("selectE");
const selectToken = document.getElementById("selectToken");
const selectLetter = document.getElementById("selectLetter");
const crackBtn = document.getElementById("crackBtn");

const barChartLetters = document.getElementById("barChartLetters");
const barChartTokens = document.getElementById("barChartTokens");

// === Testo segreto ===
const secretText = `KNOWLEDGE IS POWER AND IGNORANCE IS WEAKNESS. THE MORE WE LEARN, THE MORE WE UNDERSTAND HOW LITTLE WE KNOW. EVERY DISCOVERY OPENS A DOOR TO NEW QUESTIONS, AND EACH QUESTION LEADS US CLOSER TO THE TRUTH THAT HUMANITY HAS SOUGHT FOR CENTURIES.`;

// === Utilità matematiche ===
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function egcd(a, b) {
  a = BigInt(a); b = BigInt(b);
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const r = egcd(b, a % b);
  return { g: r.g, x: r.y, y: r.x - (a / b) * r.y };
}
function modInv(a, m) {
  const { g, x } = egcd(a, m);
  if (g !== 1n && g !== -1n) return null;
  let res = x % m;
  if (res < 0n) res += m;
  return res;
}
function modExp(base, exp, mod) {
  let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}
function trialFactor(n) {
  n = BigInt(n);
  const factors = [];
  let d = 2n;
  while (d * d <= n) {
    while (n % d === 0n) { factors.push(Number(d)); n /= d; }
    d += d === 2n ? 1n : 2n;
  }
  if (n > 1n) factors.push(Number(n));
  return factors;
}
function allDivisorsFromPrimeFactors(pf) {
  const m = new Map();
  pf.forEach(p => m.set(p, (m.get(p) || 0) + 1));
  const primes = [...m.keys()];
  const exps = primes.map(p => m.get(p));
  const divisors = [1];
  for (let i = 0; i < primes.length; i++) {
    const p = primes[i], k = exps[i];
    const len = divisors.length;
    let mul = 1;
    for (let e = 1; e <= k; e++) {
      mul *= p;
      for (let j = 0; j < len; j++) divisors.push(divisors[j] * mul);
    }
  }
  return divisors.sort((a, b) => a - b);
}
function factorSemiprime(n) {
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return { p: i, q: n / i };
  return null;
}

// === Mappatura lettere -> numeri (coprimi con N) ===
function coprimi(N) {
  const v = [];
  for (let i = 1; i < N; i++) if (gcd(i, N) === 1) v.push(i);
  return v;
}
const validNumbers = coprimi(N);
const mapping = {};
for (let i = 0; i < alphabet.length; i++) mapping[alphabet[i]] = validNumbers[i];
const reverseMapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [String(v), k]));

// === Cifratura per ottenere i token del testo segreto ===
function encryptTextToTokens(text) {
  const tokens = [];
  const up = text.toUpperCase();
  for (const ch of up) {
    if (mapping[ch] !== undefined) {
      const M = mapping[ch];
      const C = modExp(M, eDefault, N);
      tokens.push(C);
    }
  }
  return tokens;
}

// === Grafici a barre (DOM) ===
function renderFrequencyChart(container, freq, color) {
  if (!container) return;
  container.innerHTML = "";

  // Filtra solo gli elementi con frequenza > 0
  let entries = Object.entries(freq).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    container.innerHTML = "<p class='text-muted small'>Nessun dato</p>";
    return;
  }

  // 🔹 Ordina per frequenza decrescente
  entries.sort((a, b) => b[1] - a[1]);

  // 🔹 Calcola la frequenza massima per scalare le altezze
  const max = Math.max(...entries.map(([, v]) => v));

  // 🔹 Crea dinamicamente le barre ordinate
  entries.forEach(([label, val]) => {
    const wrap = document.createElement("div");
    wrap.className = "bar";

    const rect = document.createElement("div");
    rect.className = "bar-rect";
    rect.style.height = `${Math.max(6, (val / max) * 180)}px`;
    rect.style.backgroundColor = color;
    rect.title = `${label}: ${val}`;

    const lab = document.createElement("div");
    lab.className = "bar-label";
    lab.textContent = label === " " ? "␣" : label;

    wrap.appendChild(rect);
    wrap.appendChild(lab);
    container.appendChild(wrap);
  });
}

function renderTokenChart(tokens) {
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  renderFrequencyChart(barChartTokens, freq, "#007bff");
}
function renderLetterChartFromText(text) {
  const freq = {};
  for (const ch of alphabet) freq[ch] = 0;
  const up = (text || "").toUpperCase();
  for (const ch of up) if (freq[ch] !== undefined) freq[ch]++;
  renderFrequencyChart(barChartLetters, freq, "#28a745");
}

// === Popola select del box RSA Crack ===
function populateSelects(tokens) {
  // token
  if (selectToken) {
    selectToken.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = ""; ph.textContent = "-";
    selectToken.appendChild(ph);
    const unique = [...new Set(tokens)].sort((a, b) => a - b);
    unique.forEach(t => {
      const opt = document.createElement("option");
      opt.value = String(t);
      opt.textContent = String(t);
      selectToken.appendChild(opt);
    });
  }
  // lettera
  if (selectLetter) {
    selectLetter.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = ""; ph.textContent = "-";
    selectLetter.appendChild(ph);
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => {
      const opt = document.createElement("option");
      opt.value = l; opt.textContent = l;
      selectLetter.appendChild(opt);
    });
  }
}

// === Algoritmo Crack (6 passi) ===
function crackRSA() {
  const eChosen = Number(selectE.value);
  const token = Number(selectToken.value);
  const letter = (selectLetter.value || "").toUpperCase();

  if (!eChosen || !token || !letter) {
    alert("Seleziona e, token e lettera prima di premere Crack!");
    return;
  }

  const M = mapping[letter];
  if (!M) { alert("Lettera non valida o non mappata!"); return; }

  // 3) diff = |M^e - token|
  let diff = (BigInt(M) ** BigInt(eChosen)) - BigInt(token);
  if (diff < 0n) diff = -diff;

  // Divisori di diff (candidati a N)
  const pf = trialFactor(diff);
  if (pf.length === 0) { alert("N non trovato: |M^e - C| non fattorizzabile utilmente."); return; }
  const divisors = allDivisorsFromPrimeFactors(pf);

  // Scegli N: più piccolo divisore > max token e > max M
  const maxToken = Math.max(...secretCipherTokens);
  const maxM = Math.max(...Object.values(mapping));
  const candidates = divisors.filter(d => d > maxToken && d > maxM);
  if (candidates.length === 0) { alert("N non individuato fra i divisori candidati."); return; }
  const Nfound = candidates[0];

  // 4) Fattorizza N in p, q
  const pq = factorSemiprime(Nfound);
  if (!pq) { alert("N trovato non è semiprimo."); return; }
  const { p, q } = pq;

  // 5) φ(N)
  const phi = (p - 1) * (q - 1);

  // 6) d = e^{-1} mod φ(N)
  const dBig = modInv(BigInt(eChosen), BigInt(phi));
  if (dBig === null) { alert("e scelto non è invertibile modulo φ(N)."); return; }
  const d = Number(dBig);

  // Decodifica completa
  const decoded = secretCipherTokens.map(c => {
    const Mv = modExp(c, d, Nfound);
    return reverseMapping[String(Mv)] || "?";
  }).join("");

  decodedSection.style.display = "block";
  decodedText.textContent = decoded;

  // Parametri
  const old = decodedSection.querySelector(".rsa-params-box");
  if (old) old.remove();
  const resBox = document.createElement("div");
  resBox.className = "rsa-params-box mt-3 p-3 rounded";
  resBox.style.background = "#0b0b0b";
  resBox.style.color = "#eaeaea";
  resBox.style.border = "1px solid #333";
  resBox.style.display = "flex";
  resBox.style.flexDirection = "column";
  resBox.style.gap = "6px";

  resBox.innerHTML = `
    <div style="font-weight:bold; color:#dcdcdc;">🔑 RSA Parameters Found</div>
    <div style="font-family:monospace; display:flex; flex-wrap:wrap; gap:16px;">
      <span><strong>e:</strong> ${eChosen}</span>
      <span><strong>p:</strong> ${p}</span>
      <span><strong>q:</strong> ${q}</span>
      <span><strong>N:</strong> ${Nfound}</span>
      <span><strong>φ(N):</strong> ${phi}</span>
      <span><strong>d:</strong> ${d}</span>
    </div>
  `;

  decodedSection.appendChild(resBox);
}

// === Stato globale token (UNA sola volta, no duplicati) ===
let secretCipherTokens = [];

// === Init ===
window.addEventListener("DOMContentLoaded", () => {
  // 1) genera i token dal testo segreto
  secretCipherTokens = encryptTextToTokens(secretText);

  // 2) popola select con token e lettere
  populateSelects(secretCipherTokens);

  // 3) disegna grafico token (blu)
  renderTokenChart(secretCipherTokens);

  // 4) disegna grafico lettere (verde) iniziale (vuoto)
  renderLetterChartFromText("");

  // 5) listeners
  plainAnalysis?.addEventListener("input", () => {
    renderLetterChartFromText(plainAnalysis.value || "");
  });
  crackBtn?.addEventListener("click", crackRSA);
});
