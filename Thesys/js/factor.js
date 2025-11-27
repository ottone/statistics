// factor.js — modello statistico di fattorizzazione didattica

// ===== Utilità matematiche di base =====
function gcdInt(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// genera intero casuale in [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== Logica del modello statistico =====
//
// Sequenze: x_{n+1} = (x_n^2 + c1) mod N
//           y_{n+1} = (y_n^2 + c2) mod N
//
// Ad ogni passo n calcoliamo:
//   g_n = gcd(|x_n - y_n|, N)
// e accumuliamo la frequenza dei vari g_n.
//
// Valori g > 1 e < N con frequenza elevata vengono interpretati
// come candidati divisori di N.

let gcdChartInstance = null;

function runStatisticalFactorization(N, k) {
  const logLines = [];

  const tableBody = document.getElementById("iterTableBody");
  const tableBox = document.getElementById("iterTableBox");

  tableBody.innerHTML = "";
  tableBox.style.display = "block";

  const x0 = randInt(2, Math.max(3, N - 2));
  const y0 = randInt(2, Math.max(3, N - 2));
  const c1 = randInt(1, 10);
  const c2 = randInt(1, 10);

  let x = x0;
  let y = y0;

  const freq = {};
  let foundFactors = new Set();

  for (let n = 1; n <= k; n++) {
    x = (x * x + c1) % N;
    y = (y * y + c2) % N;

    const diff = Math.abs(x - y);
    const g = gcdInt(diff, N);

    // Frequenze
    freq[g] = (freq[g] || 0) + 1;
    if (g > 1 && g < N) foundFactors.add(g);

    // Riga tabella
    const row = document.createElement("tr");
    if (g > 1 && g < N) row.classList.add("table-warning");

    row.innerHTML = `
      <td>${n}</td>
      <td>${x}</td>
      <td>${y}</td>
      <td>${diff}</td>
      <td>${g}</td>
    `;
    tableBody.appendChild(row);
  }

  logLines.push(`N = ${N}`);
  logLines.push(`Iterazioni = ${k}`);
  logLines.push("");

  Object.keys(freq).sort((a,b)=>a-b).forEach(g => {
    logLines.push(`g = ${g} → ${freq[g]} occorrenze`);
  });

  if (foundFactors.size > 0) {
    logLines.push("\nPossibili fattori:");
    [...foundFactors].forEach(g => {
      logLines.push(`${N} = ${g} × ${N/g}`);
    });
  }

  return { log: logLines.join("\n"), freq };
}


// ===== Gestione interfaccia e grafico =====

function updateGcdChart(freq) {
  const ctx = document.getElementById("gcdChart");
  if (!ctx) return;

  const entries = Object.entries(freq)
    .map(([g, count]) => ({ g: Number(g), count }))
    .sort((a, b) => a.g - b.g); // ordina per valore di g

  const labels = entries.map(e => e.g);
  const data = entries.map(e => e.count);

  if (gcdChartInstance) {
    gcdChartInstance.destroy();
  }

  gcdChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Frequenza di gcd(|x_n - y_n|, N)",
          data,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "Valori g" }
        },
        y: {
          title: { display: true, text: "Occorrenze" },
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `g = ${ctx.label}, count = ${ctx.raw}`
          }
        }
      }
    }
  });
}

// ===== Inizializza interazione con l’utente =====

document.addEventListener("DOMContentLoaded", () => {
  const inputN = document.getElementById("inputN");
  const inputK = document.getElementById("inputK");
  const startBtn = document.getElementById("startFactor");
  const resultBox = document.getElementById("factorResult");
  const output = document.getElementById("factorOutput");

  if (!inputN || !inputK || !startBtn || !resultBox || !output) return;

  startBtn.addEventListener("click", () => {
    const Nval = Number(inputN.value);
    const kval = Number(inputK.value);

    const { log, freq } = runStatisticalFactorization(Nval, kval);

    resultBox.style.display = "block";
    output.textContent = log;

    if (Object.keys(freq).length > 0) {
      updateGcdChart(freq);
    }
  });
});
