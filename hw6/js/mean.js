// =======================================================
// mean.js — Functions for mean calculation
// =======================================================

// Classical (batch) arithmetic mean
export function classicalMean(data) {
  const n = data.length;
  if (n === 0) return 0;
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / n;
}

// Online (incremental) mean update
// Given previous mean M_{k-1}, next value x_k, and count k
export function onlineMeanUpdate(prevMean, newValue, k) {
  return prevMean + (newValue - prevMean) / k;
}
