import { format, isToday, isYesterday } from 'date-fns';
import { az } from 'date-fns/locale';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function startOfDayMs(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts: number): string {
  return format(ts, 'yyyy-MM-dd');
}

export function formatDate(ts: number | string, pattern = 'd MMM yyyy'): string {
  return format(new Date(ts), pattern, { locale: az });
}

export function formatDateTime(ts: number | string): string {
  const d = new Date(ts);
  if (isToday(d)) return `Bu gün, ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Dünən, ${format(d, 'HH:mm')}`;
  return format(d, 'd MMM, HH:mm', { locale: az });
}

export function formatTime(ts: number | string): string {
  return format(new Date(ts), 'HH:mm');
}

export function timeAgo(ts: number | string, now = Date.now()): string {
  const t = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Math.max(0, now - t);
  if (diff < 45_000) return 'indicə';
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MINUTE))} dəq əvvəl`;
  if (diff < 12 * HOUR) return `${Math.round(diff / HOUR)} saat əvvəl`;
  const d = new Date(t);
  if (isToday(d)) return `bu gün ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `dünən ${format(d, 'HH:mm')}`;
  return format(d, 'd MMM', { locale: az });
}

export function weekdayShort(ts: number): string {
  return format(ts, 'EEEEEE', { locale: az });
}
