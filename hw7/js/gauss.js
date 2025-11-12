// js/gauss.js
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("Gauss").getContext("2d");
  let chart = null;

  // 🔹 Funzione binomiale teorica
  function binomialProbability(n, k, p) {
    const successes = (n + k) / 2;
    if (successes < 0 || successes > n || !Number.isInteger(successes)) return 0;

    function binomialCoeff(n, k) {
      let coeff = 1;
      for (let i = 1; i <= k; i++) coeff *= (n - (k - i)) / i;
      return coeff;
    }

    return (
      binomialCoeff(n, successes) *
      Math.pow(p, successes) *
      Math.pow(1 - p, n - successes)
    );
  }

  // 🔹 Disegna istogramma + curva teorica per lo step selezionato
  function drawHistogramAtStep(step, steps, p) {
    if (!window.walkHistory || !window.walkHistory.length) return;

    const counts = {};
    for (const walk of window.walkHistory) {
      const idx = Math.max(0, Math.min(step , walk.length - 1));
      const y = walk[idx].y;
      counts[y] = (counts[y] || 0) + 1;
    }

    // 🔹 Distribuzione empirica
    const scores = Array.from({ length: 2 * step + 1 }, (_, i) => i - step);
    const freq = scores.map((s) => counts[s] || 0);

    // 🔹 Distribuzione teorica (scalata al numero di hacker)
    const m = window.walkHistory.length;
    const theoretical = scores.map(
      (k) => binomialProbability(step, k  , p) * m
    );

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: scores,
        datasets: [
          {
            label: "Empirical (simulated)",
            data: freq,
            backgroundColor: "rgba(13, 110, 253, 0.6)",
            borderColor: "#0d6efd",
          },
          {
            label: "Theoretical Binomial",
            data: theoretical,
            type: "line",
            borderColor: "#dc3545",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: `Empirical vs Theoretical Distribution – Week #${step}`,
          },
        },
        scales: {
          x: { title: { display: true, text: "Final Score (Z)" } },
          y: {
            title: { display: true, text: "Number of Hackers" },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // 🔹 Slider di controllo
  const slider = document.getElementById("stepSlider");
  const label = document.getElementById("stepLabel");

  slider.addEventListener("input", () => {
    const step = parseInt(slider.value);
    label.textContent = step;

    const p = window.lastSimulationProb || 0.5;
    const steps = window.lastSimulationSteps || parseInt(slider.max);

    drawHistogramAtStep(step, steps, p);
  });

  // 🔹 Riceve dati dal grafico principale (LLN)
  window.addEventListener("lgnDataReady", (event) => {
    const { values, steps, p, walks } = event.detail || {};
    if (values && steps) {
      console.log("Drawing histogram for", values.length, "hackers");

      // Salva lo stato globale per lo slider
      window.lastSimulationProb = p;
      window.lastSimulationSteps = steps;
      if (walks) window.walkHistory = walks;

      // Imposta slider
      slider.max = steps;
      slider.value = steps;
      label.textContent = steps;

      // Disegna il grafico finale
      drawHistogramAtStep(steps, steps, p);
    }
  });

  // 🔹 Reset del grafico
  window.addEventListener("lgnClear", () => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
});
