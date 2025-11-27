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
function drawGaussian(values, steps, p) {
  if (!values || !values.length) return;

  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  let sigma = Math.sqrt(variance);
  if (sigma < 1e-6) sigma = 1e-6;

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const margin = 0.2 * range;

  const xMin = minVal - margin;
  const xMax = maxVal + margin;

  const numPoints = 200;
  const xVals = Array.from({ length: numPoints }, (_, i) =>
    xMin + (i * (xMax - xMin)) / (numPoints - 1)
  );
  const yVals = xVals.map(x => gaussian(x, mean, sigma));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xVals,
      datasets: [{
        label: "Gaussian Distribution of X(1)",
        data: yVals,
        borderColor: "#dc3545",
        backgroundColor: "rgba(220,53,69,0.3)",
        fill: true,
        tension: 0.25,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Gaussian Distribution of Final Values X(1)" },
      },
      scales: {
        x: {
          title: { display: true, text: "Final X(1) values" },
        },
        y: {
          title: { display: true, text: "Density" },
          beginAtZero: true
        }
      }
    }
  });
}



  // riceve dati dal grafico LGN
  window.addEventListener("lgnDataReady", (event) => {
    const { values, steps, p } = event.detail || {};
    if (values && steps) {
      drawGaussian(values, steps, p);
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
