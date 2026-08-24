export function formatPence(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}
