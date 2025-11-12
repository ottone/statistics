// js/pascal.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pascalTriangle");
  if (!container) return;

  // 🔹 Crea la struttura del Triangolo di Tartaglia
  function generatePascalTriangle(steps) {
    const triangle = [];
    for (let n = 0; n <= steps; n++) {
      const row = [1];
      for (let k = 1; k < n; k++) {
        row[k] = triangle[n - 1][k - 1] + triangle[n - 1][k];
      }
      if (n > 0) row.push(1);
      triangle.push(row);
    }
    return triangle;
  }

  // 🔹 Disegna il triangolo con notazione C(n, k)
  function drawPascalTriangle(steps, observedScores) {
    const triangle = generatePascalTriangle(steps);
    container.innerHTML = ""; // pulizia

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";   // centrato
    wrapper.style.fontFamily = "monospace";
    wrapper.style.lineHeight = "1.5em";
    wrapper.style.textAlign = "center";

    triangle.forEach((row, n) => {
      const rowDiv = document.createElement("div");
      rowDiv.style.display = "flex";
      rowDiv.style.justifyContent = "center";
      rowDiv.style.gap = "0.8em"; // spazio tra celle

      row.forEach((val, k) => {
        const y = 2 * k - n; // punteggio finale corrispondente
        const cell = document.createElement("span");

        // Mostra la notazione combinatoria
        cell.textContent = `C(${n},${k})`;

        // Colore verde se il punteggio y è stato osservato
        if (observedScores.includes(y)) {
          cell.style.color = "#0f0";
          cell.style.fontWeight = "bold";
        } else {
          cell.style.color = "#777";
        }

        rowDiv.appendChild(cell);
      });

      wrapper.appendChild(rowDiv);
    });

    container.appendChild(wrapper);
  }

  // 🔹 Quando arriva una nuova simulazione
  window.addEventListener("lgnDataReady", (event) => {
    const { steps } = event.detail || {};
    if (!steps) return;

    // ottieni tutti gli score finali osservati
    const observed = (window.walkHistory || [])
      .map(w => w[w.length - 1].y)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    drawPascalTriangle(steps, observed);
  });

  // 🔹 Reset triangolo se la simulazione viene azzerata
  window.addEventListener("lgnClear", () => {
    container.innerHTML = "";
  });
});
