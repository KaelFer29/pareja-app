const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const LONG_DATE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export function formatLongDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es', LONG_DATE);
}

export function formatRelative(isoDate: string, now = new Date()) {
  const elapsed = now.getTime() - new Date(isoDate).getTime();
  if (elapsed < MINUTE_MS) return 'hace un momento';
  if (elapsed < HOUR_MS) return `hace ${Math.floor(elapsed / MINUTE_MS)} min`;
  if (elapsed < DAY_MS) return `hace ${Math.floor(elapsed / HOUR_MS)} h`;
  return `el ${formatLongDate(isoDate)}`;
}

export function parseDay(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export function toDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysBetween(from: Date, to: Date) {
  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toUtc - fromUtc) / DAY_MS);
}

export function formatDay(day: string) {
  return parseDay(day).toLocaleDateString('es', LONG_DATE);
}

export function formatDayWithoutYear(date: Date) {
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long' });
}
