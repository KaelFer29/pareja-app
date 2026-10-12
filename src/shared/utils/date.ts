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

export function formatRelativeShort(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  if (now.getTime() - date.getTime() < DAY_MS) return formatRelative(isoDate, now);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date
    .toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: sameYear ? undefined : 'numeric',
    })
    .replace('.', '');
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

export function formatWeekday(date: Date) {
  const text = date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthYear(date: Date) {
  const text = date.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}

export function timeToDate(time: string, base = new Date()) {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes);
}

export function dateToTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function formatMonthShort(date: Date) {
  return date.toLocaleDateString('es', { month: 'short' }).replace('.', '').toUpperCase();
}
