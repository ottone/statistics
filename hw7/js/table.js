// js/table.js
document.addEventListener("DOMContentLoaded", () => {

  // 🔹 Calcola coefficiente binomiale C(n, k)
  function binomialCoeff(n, k) {
    if (k < 0 || k > n) return 0;
    let coeff = 1;
    for (let i = 1; i <= k; i++) {
      coeff *= (n - (k - i)) / i;
    }
    return Math.round(coeff);
  }

  // 🔹 Popola la tabella con i risultati della simulazione
  function populateResultsTable(walks, steps) {
    const tbody = document.querySelector("#resultsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = ""; // svuota la tabella

    walks.forEach((walk, index) => {
      if (!walk || walk.length < 2) return;

      // punteggio finale
      const yFinal = walk[walk.length - 1].y;

      // ricostruisci la sequenza di passi
      const trajectory = walk
        .slice(1)
        .map((p, i) => (walk[i + 1].y - walk[i].y > 0 ? "+1" : "-1"))
        .join(", ");

      // numero di successi (k = (n + score)/2)
      const successes = (steps + yFinal) / 2;

      let binomialText = "-";
      if (Number.isInteger(successes) && successes >= 0 && successes <= steps) {
        const value = binomialCoeff(steps, successes);
        binomialText = `C(${steps}, ${successes}) = ${value}`;
      } else {
        binomialText = `– (invalid k = ${(successes).toFixed(2)})`;
      }

      const row = `
        <tr>
          <td>${index + 1}</td>
          <td style="font-family:monospace;">${trajectory}</td>
          <td style="color:${yFinal >= 0 ? '#0f0' : '#f66'};">${yFinal}</td>
          <td>${binomialText}</td>
        </tr>
      `;
      console.log(`walk ${index+1}: yFinal=${yFinal}, steps=${steps}, n+y=${steps+yFinal}, k=${successes}`);

      tbody.insertAdjacentHTML("beforeend", row);
    });
  }

  // 🔹 Riceve i dati dal grafico principale
  window.addEventListener("lgnDataReady", (event) => {
    const { steps } = event.detail || {};
    const datasets = window.lastDatasets || [];
    if (datasets.length && steps) {
      const walks = datasets.map(d => d.data);
      populateResultsTable(walks, steps);
    }
  });

  // 🔹 Supporto per aggiornamento manuale
  window.addEventListener("updateResultsTable", (event) => {
    const { walks, steps } = event.detail || {};
    if (walks && steps) {
      populateResultsTable(walks, steps);
    }
  });
});
