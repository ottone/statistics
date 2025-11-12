// js/lgn.js
window.walkHistory = []; // 🔹 memorizza tutte le camminate

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("LGN").getContext("2d");
  const attemptSelect = document.getElementById("attempt");
  const probInput = document.getElementById("probInput");
  const stepsInput = document.getElementById("stepsInput");

  // 🔹 Stato dinamico
  let PROB = parseFloat(probInput.value) || 0.5;
  let STEPS = parseInt(stepsInput.value) || 50;

  // 🔹 Stato grafico testuale
  const statusDiv = document.createElement("div");
  statusDiv.id = "status";
  statusDiv.style.marginTop = "10px";
  statusDiv.style.fontSize = "1rem";
  statusDiv.style.fontWeight = "500";
  statusDiv.style.textAlign = "center";
  statusDiv.style.color = "#0d6efd";
  attemptSelect.parentNode.insertBefore(statusDiv, attemptSelect.nextSibling);

  // ===========================================================
  // 🔹 Generazione singola camminata Bernoulli (+1 / -1)
  // ===========================================================
  function generateRandomWalk() {
    const points = [];
    let y = 0;

    // punto iniziale (server integro)
    points.push({ x: 0, y: 0 });

    // esegui esattamente STEPS attacchi
    for (let i = 1; i <= STEPS; i++) {
      const step = Math.random() < PROB ? 1 : -1; // +1 = server sicuro, -1 = breach
      y += step;
      points.push({ x: i, y });
    }

    return points;
  }

  // ===========================================================
  // 🔹 Simulazione multipla (più hacker)
  // ===========================================================
  async function generateMultipleWalksAsync(n) {
    const datasets = [];
    window.walkHistory = [];

    for (let i = 0; i < n; i++) {
      const walk = generateRandomWalk();
      window.walkHistory.push(walk);

      datasets.push({
        label: `Hacker ${i + 1}`,
        data: walk,
        borderColor: randomColor(i),
        borderWidth: 1.5,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: randomColor(i),
        pointBorderWidth: 1,
        tension: 0,
        stepped: false,
      });

      // stato di avanzamento
      if (i % Math.ceil(n / 20) === 0) {
        statusDiv.textContent = `Simulating hacker ${i + 1} of ${n}...`;
        await new Promise(r => setTimeout(r));
      }
    }

    statusDiv.textContent = "Simulation complete ✅";

    // 🔹 Calcola scala Y dinamica
    let yMin = 0, yMax = 0;
    for (const d of datasets) {
      const ys = d.data.map(p => p.y);
      yMin = Math.min(yMin, ...ys);
      yMax = Math.max(yMax, ...ys);
    }
    const margin = (yMax - yMin) * 0.1;
    chart.options.scales.y.min = yMin - margin;
    chart.options.scales.y.max = yMax + margin;

    // 🔹 Estrai punteggi finali per istogramma / binomiale
    const finalValues = datasets.map(d => d.data[d.data.length - 1].y);

    // 🔹 Salva ultimo dataset e invia evento globale
    window.lastDatasets = datasets;
    window.dispatchEvent(
      new CustomEvent("lgnDataReady", {
        detail: { values: finalValues, steps: STEPS, p: PROB },
      })
    );

    return datasets;
  }

  // ===========================================================
  // 🔹 Colore casuale coerente
  // ===========================================================
  function randomColor(seed) {
    const hue = (seed * 47) % 360;
    return `hsla(${hue}, 80%, 50%, 0.6)`;
  }

  // ===========================================================
  // 🔹 Inizializzazione del grafico Chart.js
  // ===========================================================
  const chart = new Chart(ctx, {
    type: "line",
    data: { datasets: [] },
    options: {
      parsing: false,
      showLine: true,
      responsive: true,
      animation: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Cyber Attack Simulation — Hacker Attempts (+1 / -1)",
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Number of Attacks (n)" },
          beginAtZero: true,
          min: 0,
          max: STEPS,
        },
        y: {
          title: { display: true, text: "System Breach Score (Z)" },
          min: -STEPS,
          max: STEPS,
          grid: {
            color: (ctx) =>
              ctx.tick.value === 0 ? "#000" : "rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });

  // ===========================================================
  // 🔹 Esecuzione simulazione
  // ===========================================================
  async function runSimulation() {
    const nAttempts = parseInt(attemptSelect.value);
    if (!nAttempts || nAttempts <= 0) {
      chart.data.datasets = [];
      chart.update();
      statusDiv.textContent = "";
      window.dispatchEvent(new Event("lgnClear"));
      return;
    }

    chart.data.labels = Array.from({ length: STEPS + 1 }, (_, i) => i);
    chart.options.scales.x.min = 0;
    chart.options.scales.x.max = STEPS;
    chart.options.scales.x.title.text = `Steps (0–${STEPS})`;

    chart.data.datasets = [];
    chart.update();
    statusDiv.textContent = "Simulating hacker attacks...";

    const datasets = await generateMultipleWalksAsync(nAttempts);
    chart.data.datasets = datasets;
    chart.update();
  }

  // ===========================================================
  // 🔹 EVENTI UI
  // ===========================================================
  attemptSelect.addEventListener("change", runSimulation);
  probInput.addEventListener("change", () => {
    PROB = parseFloat(probInput.value) || 0.5;
    if (attemptSelect.value) runSimulation();
  });
  stepsInput.addEventListener("change", () => {
    STEPS = parseInt(stepsInput.value) || 50;
    if (attemptSelect.value) runSimulation();
  });
});
