/** Play-Store style compact counts: 42, 1.2K+, 15K+, 1.5M+. */
export function formatCompactCount(value: number): string {
  const n = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    if (k < 10) {
      const oneDecimal = Math.floor(k * 10) / 10;
      return `${oneDecimal % 1 === 0 ? String(Math.floor(oneDecimal)) : oneDecimal.toFixed(1)}K+`;
    }
    return `${Math.floor(k)}K+`;
  }
  const m = n / 1_000_000;
  if (m < 10) {
    const oneDecimal = Math.floor(m * 10) / 10;
    return `${oneDecimal % 1 === 0 ? String(Math.floor(oneDecimal)) : oneDecimal.toFixed(1)}M+`;
  }
  return `${Math.floor(m)}M+`;
}
