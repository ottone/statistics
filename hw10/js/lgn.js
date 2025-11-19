// js/lgn.js
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("LGN").getContext("2d");
  const attemptSelect = document.getElementById("attempt");
  const probInput = document.getElementById("probInput");
  const stepsInput = document.getElementById("stepsInput");

  // stato dinamico
  let PROB = parseFloat(probInput.value) || 0.5;
  let STEPS = parseInt(stepsInput.value) || 50;

  // elemento di stato sotto ai controlli
  const statusDiv = document.createElement("div");
  statusDiv.id = "status";
  statusDiv.style.marginTop = "10px";
  statusDiv.style.fontSize = "1rem";
  statusDiv.style.fontWeight = "500";
  statusDiv.style.textAlign = "center";
  statusDiv.style.color = "#0d6efd";
  attemptSelect.parentNode.insertBefore(statusDiv, attemptSelect.nextSibling);


function generateRandomWalk(seed = Math.floor(Math.random() * 1e9)) {
  const points = [];
  let y = 0;
  const p = PROB / STEPS;             // 🔥 probabilità = λ / n

  for (let i = 0; i < STEPS; i++) {
    const rand = Math.random();       // estrae numero uniforme
    const step = rand < p ? 1 : 0;    // 0/1 come prima

    if (step === 1) y += 1;           // stesso comportamento su Y

    const t = (i + 1) / STEPS;        // 🔥 tempo continuo nell’intervallo (0,1]
    points.push({ x: t, y });
  }

  return points;
}




  // funzione asincrona per più passeggiate
  async function generateMultipleWalksAsync(n) {
    const datasets = [];
    for (let i = 0; i < n; i++) {
      const walk = generateRandomWalk(); //  senza seed
      datasets.push({
        label: `Attempt ${i + 1}`,
        data: walk,                 // [{x,y}, ...]
        borderColor: randomColor(i),
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0,
        tension: 0,                 // opzionale
        stepped: true,              // gradini (orizzontale→verticale)
      });

      if (i % Math.ceil(n / 20) === 0) {
        statusDiv.textContent = `Generation: ${Math.round((i / n) * 100)}%`;
        await new Promise((r) => setTimeout(r));
      }
    }

    statusDiv.textContent = "Complete ✅";

  // valori finali per la gaussiana (solo coordinate Y)
  const finalValues = datasets.map(d => d.data[d.data.length - 1].y);

  // evento per il grafico della gaussiana
  window.dispatchEvent(
    new CustomEvent("lgnDataReady", {
      detail: { values: finalValues, steps: STEPS, p: PROB }
    })
  );

  return datasets;

  }

  // colore casuale
  function randomColor(seed) {
    const hue = (seed * 47) % 360;
    return `hsla(${hue}, 80%, 50%, 0.6)`;
  }

// inizializzazione grafico (XY)
const chart = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [],
  },
  options: {
    parsing: false,     // usa oggetti {x,y}
    showLine: true,
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      title: { display: false, text: "LLN – Bernoulli Walk on [0,1]" },
    },
    scales: {
      x: { 
        type: "linear",
        title: { display: true, text: "t in [0,1]" },
        min: 0,
        max: 1
      },
      y: { 
        title: { display: true, text: "N(t) – Number of events" },
        beginAtZero: true,
        suggestedMax: STEPS
     },
    },
  },
});



  // funzione principale per generare e aggiornare il grafico
  async function runSimulation() {
    const nAttempts = parseInt(attemptSelect.value);
    if (!nAttempts || nAttempts <= 0) {
      chart.data.datasets = [];
      chart.update();
      statusDiv.textContent = "";
      window.dispatchEvent(new Event("lgnClear"));
      return;
    }

    // aggiorna etichette e asse X
    // aggiorna solo asse Y (X è sempre t ∈ [0,1])
    chart.data.labels = [];  // usiamo le coordinate x dei punti
    chart.options.scales.x.title.text = "t in [0,1]";
    chart.options.scales.y.suggestedMax = STEPS;


    // reset grafico
    chart.data.datasets = [];
    chart.update();
    statusDiv.textContent = "Generation in progress...";

    // genera e aggiorna
    const datasets = await generateMultipleWalksAsync(nAttempts);
    chart.data.datasets = datasets;
    chart.update();
  }

  // EVENTI
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

