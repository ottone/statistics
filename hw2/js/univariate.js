// univariate.js
// Gestione delle distribuzioni univariate con Chart.js

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Chart) {
    alert('Chart.js failed to load.');
    return;
  }

  // --- Dataset di base ---
   const data = [
      { ID: 1,  Name: "Anna",      Age: 23, Gender: "F", Grade: 29 },
      { ID: 2,  Name: "Marco",     Age: 23, Gender: "M", Grade: 30 },
      { ID: 3,  Name: "Luca",      Age: 20, Gender: "M", Grade: 27 },
      { ID: 4,  Name: "Sara",      Age: 22, Gender: "F", Grade: 26 },
      { ID: 5,  Name: "Giulia",    Age: 21, Gender: "F", Grade: 30 },
      { ID: 6,  Name: "Matteo",    Age: 24, Gender: "M", Grade: 25 },
      { ID: 7,  Name: "Elena",     Age: 22, Gender: "F", Grade: 29 },
      { ID: 8,  Name: "Davide",    Age: 23, Gender: "M", Grade: 31 },
      { ID: 9,  Name: "Chiara",    Age: 20, Gender: "F", Grade: 27 },
      { ID: 10, Name: "Alessio",   Age: 22, Gender: "M", Grade: 26 },
      { ID: 11, Name: "Francesca", Age: 23, Gender: "F", Grade: 29 },
      { ID: 12, Name: "Giorgio",   Age: 21, Gender: "M", Grade: 29 },
      { ID: 13, Name: "Martina",   Age: 20, Gender: "F", Grade: 30 },
      { ID: 14, Name: "Simone",    Age: 24, Gender: "M", Grade: 25 },
      { ID: 15, Name: "Beatrice",  Age: 22, Gender: "F", Grade: 27 },
      { ID: 16, Name: "Federico",  Age: 21, Gender: "M", Grade: 28 },
      { ID: 17, Name: "Laura",     Age: 23, Gender: "F", Grade: 29 },
      { ID: 18, Name: "Riccardo",  Age: 22, Gender: "M", Grade: 30 },
      { ID: 19, Name: "Veronica",  Age: 20, Gender: "F", Grade: 26 },
      { ID: 20, Name: "Paolo",     Age: 24, Gender: "M", Grade: 27 }
      ];

  // --- Funzioni helper ---
  const getCol = (col) => data.map(r => r[col]); // Estrae una colonna
  const computeFrequency = (arr) => {            // Conta la frequenza dei valori
    const freq = {};
    for (const v of arr) freq[v] = (freq[v] || 0) + 1;
    return freq;
  };

  const uniCtx = document.getElementById('uniChart');
  let uniChart = null;

  // --- Funzione principale ---
  function renderUnivariate(variable) {
    const col = getCol(variable);
    const freq = computeFrequency(col);
    const labels = Object.keys(freq);
    const values = Object.values(freq);

    if (uniChart) uniChart.destroy(); // distrugge grafico precedente

    // Crea grafico a barre con Chart.js
    uniChart = new Chart(uniCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `${variable} distribution`,
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `Count: ${ctx.formattedValue}` } }
        }
      }
    });
  }

  // --- Eventi ---
  document.getElementById('computeUni').addEventListener('click', () => {
    const v = document.getElementById('uniVar').value;
    if (!v) return alert('Pick a variable for Univariate.');
    renderUnivariate(v);
  });
});
