const N = 221, e = 11, d = 35;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
const plainInput = document.getElementById("plainInput");
const plainAnalysis = document.getElementById("plainAnalysis");
const cipherBox = document.getElementById("cipherBox");
const cipherOutput = document.getElementById("cipherOutput");
const comparisonSection = document.getElementById("chartsSection");
const decodedText = document.getElementById("decodedText");
const mappingGrid = document.getElementById("mappingGrid");
const mappingGridSection = document.getElementById("mappingGridSection");


let cipherTokens = [];
let freqChiaro = {};
const letterToToken = {};
let plainChart = null;

// GCD e coprimi
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function coprimi(N) {
  const v = [];
  for (let i = 1; i < N; i++) if (gcd(i, N) === 1) v.push(i);
  return v;
}
const validNumbers = coprimi(N);
const mapping = {};
for (let i = 0; i < alphabet.length; i++) mapping[alphabet[i]] = validNumbers[i];

// Esponenziazione modulare
function modExp(base, exp, mod) {
  let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(result);
}

// Analisi statistica testo in chiaro
plainAnalysis.addEventListener("input", () => {
  const text = plainAnalysis.value.toUpperCase();
  freqChiaro = {};
  for (let ch of alphabet) freqChiaro[ch] = 0;
  for (let ch of text) if (freqChiaro[ch] !== undefined) freqChiaro[ch]++;

  const total = Object.values(freqChiaro).reduce((a, b) => a + b, 0);
  const chartsSection = document.getElementById("chartsSection");

  if (total > 0) {
    chartsSection.style.display = "block";
  } else {
    chartsSection.style.display = "none";
  }

  updateBarCharts();
});


// Cifratura RSA
document.getElementById("encryptBtn").addEventListener("click", () => {
  const text = plainInput.value.toUpperCase().trim();
  if (!text) {
    alert("Inserisci un testo!");
    return;
  }
  cipherTokens = [];
  for (let c of text) {
    if (mapping[c] !== undefined) {
      const M = mapping[c];
      const C = modExp(M, e, N);
      cipherTokens.push(C);
    }
  }
  cipherOutput.textContent = cipherTokens.join(" ");
  cipherBox.style.display = "block";
});

// Mostra grafici e aggiorna
document.getElementById("analyzeBtn").addEventListener("click", () => {
  if (cipherTokens.length === 0) {
    alert("Devi prima cifrare!");
    return;
  }
  comparisonSection.style.display = "block";
  mappingGridSection.style.display = "block";
  buildMappingGrid();
  updateBarCharts();
});

// Grafici separati
function updateBarCharts() {
  const letters = alphabet.split("");
  const wrapper = document.getElementById("barChartsWrapper");
  const lettersContainer = document.getElementById("barChartLetters");
  const tokensContainer = document.getElementById("barChartTokens");

  // Calcola frequenze
  const freqToken = {};
  cipherTokens.forEach(t => freqToken[t] = (freqToken[t] || 0) + 1);

  const freqLettere = {};
  for (let ch of alphabet) freqLettere[ch] = 0;
  const text = plainAnalysis.value.toUpperCase();
  for (let ch of text) if (freqLettere[ch] !== undefined) freqLettere[ch]++;

  const lettereData = Object.entries(freqLettere).filter(([_, v]) => v > 0);
  const tokenData = Object.entries(freqToken).filter(([_, v]) => v > 0);

  // Mostra wrapper solo se c’è almeno un dato
  if (lettereData.length > 0 || tokenData.length > 0) {
    wrapper.style.display = "flex";
  } else {
    wrapper.style.display = "none";
  }

  // Normalizza
  const maxLettere = Math.max(...lettereData.map(([, v]) => v), 1);
  const maxToken = Math.max(...tokenData.map(([, v]) => v), 1);

  // Pulisci vecchi
  lettersContainer.innerHTML = "";
  tokensContainer.innerHTML = "";

  // Aggiungi barre lettere
lettereData.sort((a, b) => b[1] - a[1]).forEach(([ch, v]) => {
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.style.position = "relative"; // permette di posizionare il numero sopra

  const rect = document.createElement("div");
  rect.className = "bar-rect";
  const height = Math.max(5, (v / maxLettere) * 100);
  rect.style.height = `${height}%`;

  // 👇 Etichetta numerica sopra la barra
  const value = document.createElement("div");
  value.textContent = v;
  value.style.position = "absolute";
  value.style.bottom = `${height}%`;
  value.style.left = "50%";
  value.style.transform = "translate(-50%, -120%)";
  value.style.fontSize = "12px";
  value.style.fontWeight = "bold";
  value.style.color = "#00ff9c";
  

  const label = document.createElement("div");
  label.className = "bar-label";
  label.textContent = ch === " " ? "␣" : ch;

  bar.appendChild(rect);
  bar.appendChild(value);
  bar.appendChild(label);
  lettersContainer.appendChild(bar);
});


  // Aggiungi barre token
  tokenData.sort((a, b) => b[1] - a[1]).forEach(([tok, v]) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.position = "relative";

    const rect = document.createElement("div");
    rect.className = "bar-rect";
    rect.style.backgroundColor = "#007bff";
    rect.style.borderColor = "#007bff";
    const height = Math.max(5, (v / maxToken) * 100);
    rect.style.height = `${height}%`;

    // Etichetta numerica sopra la barra
    const value = document.createElement("div");
    value.textContent = v;
    value.style.position = "absolute";
    value.style.bottom = `${height}%`;
    value.style.left = "50%";
    value.style.transform = "translate(-50%, -120%)";
    value.style.fontSize = "12px";
    value.style.fontWeight = "bold";
    value.style.color = "#007bff";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = "T" + tok;

    bar.appendChild(rect);
    bar.appendChild(value);
    bar.appendChild(label);
    tokensContainer.appendChild(bar);
  });
}




// Mappatura token → lettera
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
   // Trova solo i token cifrati unici presenti
    const uniqueTokens = [...new Set(cipherTokens)].sort((a, b) => a - b);

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
  const tokenToLetter = {};
  for (const [letter, token] of Object.entries(letterToToken))
    tokenToLetter[token] = letter;
  decodedText.textContent = cipherTokens.map(t => tokenToLetter[t] || "?").join('');
}