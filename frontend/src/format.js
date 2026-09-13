export function formatPence(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

// Truncates (never rounds up) so a weight that hasn't actually reached a
// threshold can never display as if it had — e.g. 9999g must show as
// 9.99kg, not round up to a misleading "10kg". Mirrors the backend exactly.
export function formatKg(grams) {
  return parseFloat((Math.floor(grams / 10) / 100).toFixed(2)).toString();
}
