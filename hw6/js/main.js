// =======================================================
// main.js — UI logic and comparison tests
// =======================================================

import { classicalMean, onlineMeanUpdate } from './mean.js';
import { classicalVariance, onlineVariance } from './variance.js';

// === Mean comparison ===
function meanComparison() {
  const out = document.getElementById("resultArea");
  const sizeSelect = document.getElementById("datasetSize");
  if (!out || !sizeSelect) return;

  const n = parseInt(sizeSelect.value);
  out.value = `=== Mean Comparison ===\nDataset size: ${n.toLocaleString()} values\n\n`;

  const data = new Float64Array(n);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 100;

  // Classical mean
  const t1 = performance.now();
  const meanClassic = classicalMean(data);
  const t2 = performance.now();
  const classicalTime = t2 - t1;

  // Online mean (simulate many updates)
  let meanOnline = 0;
  const t3 = performance.now();
  for (let j = 1; j <= n; j++) {
    meanOnline = onlineMeanUpdate(meanOnline, data[j - 1], j);
  }
  const t4 = performance.now();
  const onlineTime = t4 - t3;

  out.value +=
    `Classical mean: ${meanClassic.toFixed(3)}\n` +
    `Online mean: ${meanOnline.toFixed(3)}\n\n` +
    `⏱ Classical time: ${classicalTime.toFixed(3)} ms\n` +
    `⏱ Online time: ${onlineTime.toFixed(3)} ms\n` +
    `\n💡 Online mean uses constant memory and time per update.\n`;
}

// === Variance comparison ===
function varianceComparison() {
  const out = document.getElementById("varianceResultArea");
  const sizeSelect = document.getElementById("varDatasetSize");
  if (!out || !sizeSelect) return;

  const n = parseInt(sizeSelect.value);
  out.value = `=== Variance Comparison ===\nDataset size: ${n.toLocaleString()} values\n\n`;

  const data = new Float64Array(n);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 100;

  const t1 = performance.now();
  const varClassic = classicalVariance(data);
  const t2 = performance.now();
  const classicalTime = t2 - t1;

  const t3 = performance.now();
  const varOnline = onlineVariance(data);
  const t4 = performance.now();
  const onlineTime = t4 - t3;

  out.value +=
    `Classical variance: ${varClassic.toFixed(4)}\n` +
    `Online variance: ${varOnline.toFixed(4)}\n\n` +
    `⏱ Classical time: ${classicalTime.toFixed(3)} ms\n` +
    `⏱ Online time: ${onlineTime.toFixed(3)} ms\n` +
    `\n💡 Online variance avoids recomputing the whole dataset.\n`;
}

// === Attach events ===
window.addEventListener("DOMContentLoaded", () => {
  const meanBtn = document.getElementById("runIncrementalBtn");
  const varBtn = document.getElementById("runVarianceBtn");

  if (meanBtn) meanBtn.addEventListener("click", meanComparison);
  if (varBtn) varBtn.addEventListener("click", varianceComparison);
});
