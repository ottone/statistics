// rsa.js — versione dinamica e coerente con tutta la pipeline

let N = 221;
let eDefault = 11;

const selectNParam = document.getElementById("selectN");
const selectEParam = document.getElementById("selectEParam");

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

// ===== Fattorizzazione semplice (solo per visualizzazione didattica) =====
function factorSemiprimeSimple(n) {
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return { p: i, q: n / i };
  }
  return null;
}

// ===== DOM =====
const plainAnalysis = document.getElementById("plainAnalysis");
const decodedSection = document.getElementById("decodedSection");
const decodedText = document.getElementById("decodedText");

const selectE = document.getElementById("selectE");
const selectToken = document.getElementById("selectToken");
const selectLetter = document.getElementById("selectLetter");
const crackBtn = document.getElementById("crackBtn");

const barChartTokens = document.getElementById("barChartTokens");

const inputN = document.getElementById("inputN");
const inputE = document.getElementById("inputE");
const applyBtn = document.getElementById("applyRSAParams");

// ===== Testo segreto =====
const secretText = `KNOWLEDGE IS POWER AND IGNORANCE IS WEAKNESS. 
THE MORE WE LEARN, THE MORE WE UNDERSTAND HOW LITTLE WE KNOW.`;

// ===== Matematica =====
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
  return (x % m + m) % m;
}

function modExp(base, exp, mod) {
  let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % BigInt(mod);
    b = (b * b) % BigInt(mod);
    e >>= 1n;
  }
  return Number(result);
}

// ===== Mapping dinamico =====
let mapping = {};
let reverseMapping = {};

function coprimi(N) {
  const v = [];
  for (let i = 1; i < N; i++) if (gcd(i, N) === 1) v.push(i);
  return v;
}

function rebuildMapping() {
  const validNumbers = coprimi(N);
  mapping = {};
  alphabet.split("").forEach((ch, i) => {
    mapping[ch] = validNumbers[i];
  });
  reverseMapping = Object.fromEntries(
    Object.entries(mapping).map(([k, v]) => [String(v), k])
  );
}

// ===== Cifratura =====
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

// ===== Stato =====
let secretCipherTokens = [];

// ===== Render token =====
function renderTokenChart(tokens) {
  if (!barChartTokens) return;
  barChartTokens.textContent = tokens.join(" ");
}

// ===== Select =====
function populateSelects(tokens) {
  if (!selectToken || !selectLetter) return;

  selectToken.innerHTML = "";
  [...new Set(tokens)].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    selectToken.appendChild(opt);
  });

  selectLetter.innerHTML = "";
  alphabet.trim().split("").forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    selectLetter.appendChild(opt);
  });
}

// ===== Crack RSA dimostrativo =====
function crackRSA() {
  const eChosen = Number(selectE.value);
  const token = Number(selectToken.value);
  const letter = selectLetter.value;

  if (!eChosen || !token || !letter) {
    alert("Select e, token and letter");
    return;
  }

  const M = mapping[letter];
  let diff = (BigInt(M) ** BigInt(eChosen)) - BigInt(token);
  if (diff < 0n) diff = -diff;

  decodedSection.style.display = "block";
  decodedText.textContent = "Candidate N: " + diff;
}

// ===== UI Update =====
function updateUI() {
  const pq = factorSemiprimeSimple(N);
  const p = pq ? pq.p : "?";
  const q = pq ? pq.q : "?";

  document.getElementById("displayE").textContent = eDefault;
  document.getElementById("displayN").textContent = N;
  document.getElementById("displayP").textContent = p;
  document.getElementById("displayQ").textContent = q;
  document.getElementById("displayTokens").textContent = secretCipherTokens.join(", ");
}

// ===== Applica nuovi parametri RSA =====
function regenerateRSA() {
  rebuildMapping();
  secretCipherTokens = encryptTextToTokens(secretText);

  window.secretCipherTokens = secretCipherTokens;
  window.reverseMapping = reverseMapping;

  populateSelects(secretCipherTokens);
  renderTokenChart(secretCipherTokens);
  updateUI();   // ✅ OBBLIGATORIO
}


// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

  rebuildMapping();
  regenerateRSA();

  crackBtn?.addEventListener("click", crackRSA);

  applyBtn?.addEventListener("click", () => {
    
    const newN = Number(selectNParam.value);
    const newE = Number(selectEParam.value);
    
    if (!newN || !newE) {
      alert("Insert valid N and e");
      return;
    }

    N = newN;
    eDefault = newE;
    regenerateRSA();
  });
});
