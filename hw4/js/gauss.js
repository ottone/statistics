// js/gauss.js
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("Gauss").getContext("2d");
  let chart;

  // Funzione densità di Gauss (standard)
  function gaussian(x, mu, sigma) {
    const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mu, 2) / (2 * sigma * sigma);
    return coeff * Math.exp(exponent);
  }

  // Disegna la gaussiana ruotata con scala coerente ai "passi"
  function drawRotatedGaussian(values, steps, p) {
    if (!values || !values.length) return;

    // media e sigma empirici
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const sigma = Math.sqrt(variance);

    // genera punti per la curva
    const yVals = Array.from({ length: steps + 1 }, (_, i) => i);
    //const xVals = yVals.map(y => gaussian(y, mean, sigma));
    const xVals = yVals.map(y => gaussian(y, mean, sigma) * steps);

    // distrugge eventuale grafico precedente
    if (chart) chart.destroy();

    // crea il nuovo grafico Chart.js
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: yVals,
        datasets: [
          {
            label: "",
            data: xVals,
            borderColor: "#dc3545",
            backgroundColor: "rgba(220,53,69,0.3)",
            fill: true,
            tension: 0.25,
          },
        ],
      },
      options: {
        indexAxis: "y", // ruotato
        responsive: true,
        animation: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
        },
        scales: {
      x: { title: { display: false }, beginAtZero: true },
      y: {
        title: { display: false },
        min: 0,
        max: steps,
        reverse: true, // 👈 inverte l’asse Y
        ticks: {
          callback: v =>
            Intl.NumberFormat("it-IT", { notation: "compact" }).format(v),
          },
        },
      },
    },
  });
}

  // riceve dati dal grafico LGN
  window.addEventListener("lgnDataReady", (event) => {
    const { values, steps, p } = event.detail || {};
    if (values && steps) {
      drawRotatedGaussian(values, steps, p);
    }
  });

  // svuota il grafico se LGN viene resettato
  window.addEventListener("lgnClear", () => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
});
