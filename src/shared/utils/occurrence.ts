import { daysBetween, parseDay } from './date';

export type Recurring = {
  date: string;
  repeats_yearly: boolean;
};

export type Occurrence = {
  date: Date;
  daysLeft: number;
  years: number | null;
};

function dateInYear(original: Date, year: number) {
  const candidate = new Date(year, original.getMonth(), original.getDate());
  if (candidate.getMonth() !== original.getMonth()) {
    return new Date(year, original.getMonth() + 1, 0);
  }
  return candidate;
}

export function getOccurrence(item: Recurring, today: Date): Occurrence | null {
  const original = parseDay(item.date);

  if (!item.repeats_yearly || daysBetween(today, original) >= 0) {
    const daysLeft = daysBetween(today, original);
    return daysLeft >= 0 ? { date: original, daysLeft, years: null } : null;
  }

  let next = dateInYear(original, today.getFullYear());
  if (daysBetween(today, next) < 0) next = dateInYear(original, today.getFullYear() + 1);

  return {
    date: next,
    daysLeft: daysBetween(today, next),
    years: next.getFullYear() - original.getFullYear(),
  };
}

export function sortByUpcoming<T extends Recurring>(
  items: T[],
  today: Date,
): (T & { occurrence: Occurrence | null })[] {
  const withOccurrence = items.map((item) => ({ ...item, occurrence: getOccurrence(item, today) }));
  const upcoming = withOccurrence
    .filter((item) => item.occurrence)
    .sort((a, b) => (a.occurrence?.daysLeft ?? 0) - (b.occurrence?.daysLeft ?? 0));
  const past = withOccurrence
    .filter((item) => !item.occurrence)
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...upcoming, ...past];
}

export function formatDaysLeft(daysLeft: number) {
  if (daysLeft === 0) return 'Hoy';
  if (daysLeft === 1) return 'Mañana';
  return `En ${daysLeft} días`;
}

export function formatYears(years: number | null) {
  if (!years) return null;
  return years === 1 ? '1 año' : `${years} años`;
}
