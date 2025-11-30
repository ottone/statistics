// factor.js — versione migliorata con istogramma diff aggiuntivo

// ===== Utilità matematiche =====
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

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let gcdChartInstance = null;
let diffChartInstance = null;

// ===== Algoritmo statistico =====
function runStatisticalFactorization(N, k, S) {
  const logLines = [];

  // Nascondi tabella
  const tableBox = document.getElementById("iterTableBox");
  const tableBody = document.getElementById("iterTableBody");
  tableBody.innerHTML = "";
  tableBox.style.display = "none";

  // Frequenze
  const freqPerSeq = [];
  const diffPerSeq = [];
  for (let i = 0; i < S; i++) {
    freqPerSeq.push({});
    diffPerSeq.push({});
  }

  const globalFreq = {};
  let foundFactors = new Set();

  // ===== Esegui S sequenze =====
  for (let s = 0; s < S; s++) {
    const x0 = randInt(2, Math.max(3, N - 2));
    const y0 = randInt(2, Math.max(3, N - 2));
    const c1 = randInt(1, 10);
    const c2 = randInt(1, 10);

    let x = x0;
    let y = y0;

    //logLines.push(`Sequence ${s + 1}: x0=${x0}, y0=${y0}, c1=${c1}, c2=${c2}`);

    for (let n = 1; n <= k; n++) {
      x = (x * x + c1) % N;
      y = (y * y + c2) % N;

      const diff = Math.abs(x - y);
      const g = gcdInt(diff, N);

      // Frequenze g
      globalFreq[g] = (globalFreq[g] || 0) + 1;
      freqPerSeq[s][g] = (freqPerSeq[s][g] || 0) + 1;

      if (g > 1 && g < N) foundFactors.add(g);

      // Frequenze diff
      diffPerSeq[s][diff] = (diffPerSeq[s][diff] || 0) + 1;
    }

    //logLines.push("");
  }

  // ===== Statistiche su g =====
  const counts = Object.values(globalFreq);
  const mean =
    counts.reduce((sum, x) => sum + x, 0) / counts.length;

  const variance =
    counts.reduce((acc, x) => acc + (x - mean) ** 2, 0) / counts.length;

  const stdDev = Math.sqrt(variance);

  logLines.push(`Mean (on g frequencies) = ${mean.toFixed(3)}`);
  logLines.push(`Std Dev = ${stdDev.toFixed(3)}\n`);

  // ===== nuovo z-score inverso =====
  //
  //   z_g = (mean - freq[g]) / stdDev
  // 
  // → g molto raro => freq bassa => z alto => candidato fattore
  //
  const zScores = {};
  Object.keys(globalFreq).forEach(g => {
    const freq = globalFreq[g];
    zScores[g] = stdDev > 0 ? (mean - freq) / stdDev : 0;
  });

  // Stampa risultati
  Object.keys(globalFreq)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(g => {
      logLines.push(
        `g = ${g} → ${globalFreq[g]} (z=${zScores[g].toFixed(2)})`
      );
    });

  logLines.push("");

  // ===== Individua FATTORI con z alto =====
  //
  // Soglia: z ≥ 1.5 (più sensibile)
  //
  const signif = Object.keys(globalFreq)
    .map(Number)
    .filter(g => g > 1 && g < N && zScores[g] >= 0);

  if (signif.length > 0) {
    logLines.push("Candidate factors (z ≥ 1.5):");
    signif.forEach(g => {
      logLines.push(`→ g=${g}, N=${N} = ${g} × ${N / g}`);
    });
  } else {
    logLines.push("No statistically significant low-frequency gcd values.");
  }

  return { log: logLines.join("\n"), freqPerSeq, diffPerSeq };
}


// ===== Grafico gcd =====
function updateGcdChart(freqPerSeq) {
  const ctx = document.getElementById("gcdChart");
  if (!ctx) return;

  const allGs = new Set();
  freqPerSeq.forEach(seq => Object.keys(seq).forEach(g => allGs.add(Number(g))));
  const labels = [...allGs].sort((a, b) => a - b);

  const S = freqPerSeq.length;
  const datasets = [];
  const baseColor = "0,180,255";

  for (let s = 0; s < S; s++) {
    const data = labels.map(g => freqPerSeq[s][g] || 0);
    datasets.push({
      label: "Seq " + (s + 1),
      data,
      backgroundColor: `rgba(${baseColor}, ${0.15 + 0.15 * s})`,
      borderColor: `rgba(${baseColor}, 0.7)`,
      borderWidth: 1
    });
  }

  if (gcdChartInstance) gcdChartInstance.destroy();

  gcdChartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "g values" } },
        y: { beginAtZero: true, title: { display: true, text: "Frequency" } }
      }
    }
  });
}

// ===== Grafico diff ===== 🔥 NUOVO!
// ===== Grafico diff ===== (stesso colore del grafico gcd)
function updateDiffChart(diffPerSeq) {
  const ctx = document.getElementById("diffChart");
  if (!ctx) return;

  const allDiff = new Set();
  diffPerSeq.forEach(seq =>
    Object.keys(seq).forEach(d => allDiff.add(Number(d)))
  );
  const labels = [...allDiff].sort((a, b) => a - b);

  const S = diffPerSeq.length;
  const datasets = [];

  // 🔵 STESSO COLORE DEL GCD CHART
  const baseColor = "0,180,255";

  for (let s = 0; s < S; s++) {
    const data = labels.map(d => diffPerSeq[s][d] || 0);

    datasets.push({
      label: "Seq " + (s + 1),
      data,
      backgroundColor: `rgba(${baseColor}, ${0.15 + 0.15 * s})`,
      borderColor: `rgba(${baseColor}, 0.7)`,
      borderWidth: 1
    });
  }

  if (diffChartInstance) diffChartInstance.destroy();

  diffChartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: "Difference |x − y|" } },
        y: { beginAtZero: true, title: { display: true, text: "Frequency" } }
      }
    }
  });
}


// ===== UI =====
document.addEventListener("DOMContentLoaded", () => {
  const inputN = document.getElementById("inputN");
  const inputK = document.getElementById("inputK");
  const inputS = document.getElementById("inputS");
  const startBtn = document.getElementById("startFactor");
  const resultBox = document.getElementById("factorResult");
  const output = document.getElementById("factorOutput");

  startBtn.addEventListener("click", () => {
    const N = Number(inputN.value);
    const k = Number(inputK.value);
    const S = Number(inputS.value);

    const { log, freqPerSeq, diffPerSeq } =
      runStatisticalFactorization(N, k, S);

    resultBox.style.display = "block";
    output.textContent = log;

    updateGcdChart(freqPerSeq);
    updateDiffChart(diffPerSeq);  // 🔥 NUOVO
  });
});
