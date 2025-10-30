const N = 221, e = 11, d = 35;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
const plainAnalysis = document.getElementById("plainAnalysis");
const cipherBox = document.getElementById("cipherBox");
const cipherOutput = document.getElementById("cipherOutput");
const decodedText = document.getElementById("decodedText");
const mappingGrid = document.getElementById("mappingGrid");
const mappingGridSection = document.getElementById("mappingGridSection");

let cipherTokens = [];
let secretCipherTokens = [];
let freqChiaro = {};
const letterToToken = {};
let plainChart = null;

// 🔹 Testo segreto (non mostrato mai all’utente)
const secretText = `KNOWLEDGE IS POWER AND IGNORANCE IS WEAKNESS. THE MORE WE LEARN, THE MORE WE UNDERSTAND HOW LITTLE WE KNOW. EVERY DISCOVERY OPENS A DOOR TO NEW QUESTIONS, AND EACH QUESTION LEADS US CLOSER TO THE TRUTH THAT HUMANITY HAS SOUGHT FOR CENTURIES.
`;

// -------------------- RSA utilità --------------------
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function coprimi(N) {
  const v = [];
  for (let i = 1; i < N; i++) if (gcd(i, N) === 1) v.push(i);
  return v;
}
const validNumbers = coprimi(N);
const mapping = {};
for (let i = 0; i < alphabet.length; i++) mapping[alphabet[i]] = validNumbers[i];

function modExp(base, exp, mod) {
  let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

// -------------------- Funzioni principali --------------------
function encryptTextToTokens(text) {
  const tokens = [];
  const upper = text.toUpperCase().trim();
  for (let c of upper) {
    if (mapping[c] !== undefined) {
      const M = mapping[c];
      const C = modExp(M, e, N);
      tokens.push(C);
    }
  }
  return tokens;
}

// 🔹 Analizza testo inserito dall’utente nel box
function recalcAllFromPlainAnalysis() {
  const src = plainAnalysis.value || "";
  const text = src.toUpperCase();

  freqChiaro = {};
  for (let ch of alphabet) freqChiaro[ch] = 0;
  for (let ch of text) if (freqChiaro[ch] !== undefined) freqChiaro[ch]++;

  const total = Object.values(freqChiaro).reduce((a, b) => a + b, 0);
  if (total === 0) {
    const wrapper = document.getElementById("barChartsWrapper");
    const lettersContainer = document.getElementById("barChartLetters");

    if (lettersContainer) lettersContainer.innerHTML = ""; // 🔹 pulisci il grafico
    return;
  }

  if (typeof updateBarCharts === "function") updateBarCharts(text);
}

// -------------------- Grafico frequenza lettere (testo utente) --------------------
function updateBarCharts(text) {
  const wrapper = document.getElementById("barChartsWrapper");
  const lettersContainer = document.getElementById("barChartLetters");

  // Mostra il contenitore dei grafici
  wrapper.style.display = "flex";

  // Calcola la frequenza delle lettere
  const freq = {};
  for (let ch of alphabet) freq[ch] = 0;
  for (let ch of text) if (freq[ch] !== undefined) freq[ch]++;

  // Filtra solo quelle con conteggio > 0
  const data = Object.entries(freq).filter(([_, v]) => v > 0);
  if (data.length === 0) {
    lettersContainer.innerHTML = "<p class='text-muted'>Nessuna lettera valida trovata.</p>";
    return;
  }

  // Svuota il grafico precedente
  lettersContainer.innerHTML = "";

  // Trova la frequenza massima per il calcolo delle altezze
  const maxLettere = Math.max(...data.map(([, v]) => v), 1);
  const maxBarHeight = 180; // altezza massima in px

  // Crea le barre
  data.sort((a, b) => b[1] - a[1]).forEach(([ch, v]) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.position = "relative";

    const rect = document.createElement("div");
    rect.className = "bar-rect";
    rect.style.backgroundColor = "#28a745";
    rect.style.borderColor = "#28a745";
    const height = Math.max(5, (v / maxLettere) * maxBarHeight);
    rect.style.height = `${height}px`;

    const value = document.createElement("div");
    value.textContent = v;
    value.style.position = "absolute";
    value.style.bottom = `${height + 16}px`; // un po’ più sopra
    value.style.left = "50%";
    value.style.transform = "translateX(-50%)";
    value.style.fontSize = "12px";
    value.style.fontWeight = "bold";
    value.style.color = "#28a745";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = ch === " " ? "␣" : ch;

    bar.appendChild(rect);
    bar.appendChild(value);
    bar.appendChild(label);
    lettersContainer.appendChild(bar);
  });
}


// -------------------- Grafico token segreti --------------------
function renderSecretCipherChart() {
  const tokensContainer = document.getElementById("barChartTokens");
  const wrapper = document.getElementById("barChartsWrapper");

  // Frequenze token
  const freqToken = {};
  secretCipherTokens.forEach(t => freqToken[t] = (freqToken[t] || 0) + 1);
  const tokenData = Object.entries(freqToken).filter(([_, v]) => v > 0);

  wrapper.style.display = "flex";
  tokensContainer.innerHTML = "";

  const maxToken = Math.max(...tokenData.map(([, v]) => v), 1);

  tokenData.sort((a, b) => b[1] - a[1]).forEach(([tok, v]) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.position = "relative";

    const rect = document.createElement("div");
    rect.className = "bar-rect";
    rect.style.backgroundColor = "#007bff";
    rect.style.borderColor = "#007bff";
    // Altezza proporzionale in pixel
    const maxBarHeight = 180; // altezza massima in px del grafico
    const barHeight = Math.max(5, (v / maxToken) * maxBarHeight);
    rect.style.height = `${barHeight}px`;

    const value = document.createElement("div");
    value.textContent = v;
    value.style.position = "absolute";
    value.style.bottom = `${barHeight + 8}px`;
    value.style.left = "50%";
    value.style.transform = "translate(-50%, -120%)";
    value.style.fontSize = "12px";
    value.style.fontWeight = "bold";
    value.style.color = "#007bff";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.innerHTML = `<div>T</div><div class="token-number">${tok}</div>`;

    bar.appendChild(rect);
    bar.appendChild(value);
    bar.appendChild(label);
    tokensContainer.appendChild(bar);
  });

  // Mostra solo il box del ciphertext cifrato
  cipherOutput.textContent = secretCipherTokens.join(" ");
  cipherBox.style.display = "block";

  // Mappatura attiva
  mappingGridSection.style.display = "block";
  buildMappingGrid();
}

// -------------------- Griglia e decodifica --------------------
function buildMappingGrid() {
  mappingGrid.innerHTML = "";
  alphabet.split("").forEach(letter => {
    const cell = document.createElement("div");
    cell.classList.add("mapping-cell");
    const label = document.createElement("strong");
    label.textContent = letter === " " ? "␣" : letter;

    const select = document.createElement("select");
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "-";
    select.appendChild(empty);

    const uniqueTokens = [...new Set(secretCipherTokens)].sort((a, b) => a - b);
    uniqueTokens.forEach(token => {
      const opt = document.createElement("option");
      opt.value = token;
      opt.textContent = token;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      if (select.value) letterToToken[letter] = select.value;
      else delete letterToToken[letter];
      updateDecodedText();
    });

    cell.appendChild(label);
    cell.appendChild(select);
    mappingGrid.appendChild(cell);
  });
}

function updateDecodedText() {
  const decodedSection = document.getElementById("decodedSection");
  if (!decodedSection) return;

  const tokenToLetter = {};
  for (const [letter, token] of Object.entries(letterToToken)) {
    if (token) tokenToLetter[String(token)] = letter;
  }

  const hasMappings = Object.keys(tokenToLetter).length > 0;
  if (!hasMappings) {
    decodedSection.style.display = "none";
    decodedText.textContent = "";
    return;
  }

  const decoded = secretCipherTokens
    .map(t => tokenToLetter[String(t)] || " ")
    .join("");

  decodedSection.style.display = "block";
  decodedText.textContent = decoded;
}

// -------------------- Inizializzazione --------------------
document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Cifra il testo segreto
  secretCipherTokens = encryptTextToTokens(secretText);
  renderSecretCipherChart();

  // 🔹 Gestisci input dell’utente per analisi del testo in chiaro
  plainAnalysis?.addEventListener("input", debounce(recalcAllFromPlainAnalysis, 200));
});

// -------------------- Utilità debounce --------------------
function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}
