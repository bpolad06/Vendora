const NBSP = '\u00A0';

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatNumber(value: number, decimals = 0): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? '−' : '';
  const [int, frac] = Math.abs(safe).toFixed(decimals).split('.');
  return sign + groupThousands(int) + (frac ? `,${frac}` : '');
}

export function formatAZN(value: number): string {
  return `${formatNumber(value, 2)}${NBSP}₼`;
}

export function formatAZNShort(value: number): string {
  if (Math.abs(value) >= 10000) return `${formatNumber(value / 1000, 1)}${NBSP}min${NBSP}₼`;
  return formatAZN(value);
}

export function formatQty(value: number, unit = 'ədəd'): string {
  return `${formatNumber(value)}${NBSP}${unit}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatNumber(Math.abs(value), 1)}%`;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^994/, '');
  if (digits.length !== 9) return raw;
  return `+994 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

export function pluralizeAz(count: number, word: string): string {
  return `${formatNumber(count)} ${word}`;
}
