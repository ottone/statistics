// ---- FREQUENCY ANALYSIS ----
const freqCtx = document.getElementById('freqChart');
let freqChart;

// Analisi frequenze
document.getElementById('analyzeText').addEventListener('click', () => {
  const text = document.getElementById('plainText').value
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  if (!text) return alert("Please enter some text.");

  // Inizializza tutte le lettere da A a Z con valore 0
  const freq = {};
  const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  alphabet.forEach(l => freq[l] = 0);

  // Conta le lettere presenti
  for (let c of text) {
    if (freq[c] !== undefined) freq[c]++;
  }

  // Prepara i dati ordinati (A → Z)
  const letters = alphabet;
  const counts = letters.map(l => freq[l]);

  // Ricrea il grafico
  if (freqChart) freqChart.destroy();

  freqChart = new Chart(freqCtx, {
    type: 'bar',
    data: {
      labels: letters,
      datasets: [{
        label: 'Letter Frequency',
        data: counts,
        backgroundColor: '#00c4ff',
        borderColor: '#00c4ff',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          ticks: { 
            color: "#00c4ff", 
            font: { size: 14 },
            autoSkip: false, 
            callback: function(value, index, values) {
              const letter = this.getLabelForValue(value);
              return `${index}\n${letter}`; // 🔹 lettera sopra, numero sotto
              } 
          },
          title: { display: true, text: 'Letter', color: "#00c4ff" },
          grid: { color: 'rgba(255,255,255,0.2)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#00c4ff" },
          title: { display: true, text: 'Count', color: "#00c4ff" },
          grid: { color: 'rgba(255,255,255,0.2)' }
        }
      },
      plugins: {
        legend: { labels: { color: "#00c4ff" } }
      }
    }
  });
});


// ---- CAESAR CIPHER ----

// genera shift casuale
const shift = Math.floor(Math.random() * 26);
const plainMessage = "KNOWLEDGE IS POWER AND FREQUENCY ANALYSIS REVEALS PATTERNS";
const cipherText = caesarEncode(plainMessage, shift);

document.getElementById('cipherText').textContent = cipherText;

document.getElementById('tryDecode').addEventListener('click', () => {
  const guess = parseInt(document.getElementById('shiftGuess').value);
  if (isNaN(guess)) return alert("Enter a shift value between 0 and 25.");

  const decoded = caesarDecode(cipherText, guess);
  document.getElementById('decodedOutput').value = decoded;

  if (guess === shift) {
    document.getElementById('decodedOutput').style.color = "#00ff88"; // verde → corretto
  } else {
    document.getElementById('decodedOutput').style.color = "#ff6666"; // rosso → errato
  }
});

// Funzioni utili per cifrare/decifrare
function caesarEncode(text, shift) {
  return text.replace(/[A-Z]/g, c =>
    String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65)
  );
}

function caesarDecode(text, shift) {
  return text.replace(/[A-Z]/g, c =>
    String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65)
  );
}
