// =======================================================
// variance.js — Functions for variance calculation
// =======================================================


// Classical variance
export function classicalVariance(data) {
  const n = data.length;
  if (n <= 1) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const sqDiff = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0);
  return sqDiff / (n - 1);
}

// Online variance using Welford’s algorithm
export function onlineVariance(data) {
  let mean = 0;
  let M2 = 0;
  const n = data.length;
  for (let k = 1; k <= n; k++) {
    const x = data[k - 1];
    const delta = x - mean;
    mean += delta / k;
    M2 += delta * (x - mean);
  }
  return M2 / (n - 1);
}
