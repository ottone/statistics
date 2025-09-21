
const dati = [10, 20, 30, 40, 50];
const media = dati.reduce((a, b) => a + b, 0) / dati.length;
document.getElementById("risultato").textContent = `La media è: ${media}`;
