// bivariate.js
// Visualizzazione bivariata come scatter plot, con conversione delle categorie in numeri
// e dimensione dei punti proporzionale alla frequenza delle coppie (v1, v2)

document.addEventListener('DOMContentLoaded', () => {
  if (!window.Chart) {
    alert('Chart.js failed to load.');
    return;
  }

  // --- Dataset di base ---
  const data = [
    { ID: 1, Name: "Anna", Age: 23, Gender: "F", Grade: 29 },
    { ID: 2, Name: "Marco", Age: 23, Gender: "M", Grade: 30 },
    { ID: 3, Name: "Luca", Age: 20, Gender: "M", Grade: 27 },
    { ID: 4, Name: "Sara", Age: 22, Gender: "F", Grade: 26 },
    { ID: 5, Name: "Giulia", Age: 21, Gender: "F", Grade: 30 },
    { ID: 6, Name: "Matteo", Age: 24, Gender: "M", Grade: 25 },
    { ID: 7, Name: "Elena", Age: 22, Gender: "F", Grade: 29 },
    { ID: 8, Name: "Davide", Age: 23, Gender: "M", Grade: 31 },
    { ID: 9, Name: "Chiara", Age: 20, Gender: "F", Grade: 27 },
    { ID: 10, Name: "Alessio", Age: 22, Gender: "M", Grade: 26 },
    { ID: 11, Name: "Francesca", Age: 23, Gender: "F", Grade: 29 },
    { ID: 12, Name: "Giorgio", Age: 21, Gender: "M", Grade: 29 },
    { ID: 13, Name: "Martina", Age: 20, Gender: "F", Grade: 30 },
    { ID: 14, Name: "Simone", Age: 24, Gender: "M", Grade: 25 },
    { ID: 15, Name: "Beatrice", Age: 22, Gender: "F", Grade: 27 },
    { ID: 16, Name: "Federico", Age: 21, Gender: "M", Grade: 28 },
    { ID: 17, Name: "Laura", Age: 23, Gender: "F", Grade: 29 },
    { ID: 18, Name: "Riccardo", Age: 22, Gender: "M", Grade: 30 },
    { ID: 19, Name: "Veronica", Age: 20, Gender: "F", Grade: 26 },
    { ID: 20, Name: "Paolo", Age: 24, Gender: "M", Grade: 27 }
  ];

  const biCtx = document.getElementById('biChart');
  let biChart = null;

  // --- Converte una variabile in numeri (come M o F cosi da usarle nei grafici ---
  function encodeVariable(values) {
    const unique = [...new Set(values)];
    const mapping = {};
    unique.forEach((val, i) => {
      if (typeof val === "number") mapping[val] = val;
      else mapping[val] = i; // assegna numero progressivo per categorie
    });
    return mapping;
  }

  // --- Funzione principale ---
  function renderBivariate(v1, v2) {
    if (biChart) biChart.destroy();

    const col1 = data.map(r => r[v1]);
    const col2 = data.map(r => r[v2]);

    // Mappa categorie → numeri
    const map1 = encodeVariable(col1);
    const map2 = encodeVariable(col2);

    console.log(`Mapping for ${v1}:`, map1);
    console.log(`Mapping for ${v2}:`, map2);

    // Raggruppa le coppie e conta le occorrenze
    const grouped = {};
    data.forEach(r => {
      const x = map1[r[v1]];
      const y = map2[r[v2]];
      const key = `${x}|${y}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    // Crea punti unici con raggio proporzionale alla frequenza
    const points = Object.entries(grouped).map(([key, count]) => {
      const [x, y] = key.split('|').map(Number);
      return { x, y, r: 4 + count * 2 }; // base 4, cresce di 2 per ogni occorrenza
    });

    // --- Grafico bubble per gestire il raggio r ---
    biChart = new Chart(biCtx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: `${v1} vs ${v2}`,
          data: points,
          backgroundColor: '#00c4ff',
          borderColor: '#00c4ff',
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: v1 } },
          y: { title: { display: true, text: v2 } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => {
                const occ = Math.round((ctx.raw.r - 4) / 2);
                return `(${ctx.raw.x}, ${ctx.raw.y}) — ${occ + 1} occurrence${occ > 0 ? 's' : ''}`;
              }
            }
          }
        }
      }
    });
  }

  // --- Event listener ---
  document.getElementById('computeBi').addEventListener('click', () => {
    const v1 = document.getElementById('biVar1').value;
    const v2 = document.getElementById('biVar2').value;
    if (!v1 || !v2) return alert('Pick two variables for Bivariate.');
    if (v1 === v2) return alert('Choose two different variables.');
    renderBivariate(v1, v2);
  });
});
