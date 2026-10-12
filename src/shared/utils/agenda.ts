import { addDays, daysBetween, parseDay, toDay } from './date';
import type { Recurring } from './occurrence';

export type AgendaEvent = {
  id: string;
  title: string;
  starts_on: string;
  ends_on: string | null;
  start_time: string | null;
  end_time: string | null;
  outing_streak?: number | null;
};

export type AgendaSpecial = Recurring & {
  id: string;
  title: string;
};

export type AgendaItem = {
  key: string;
  kind: 'plan' | 'special';
  id: string;
  title: string;
  day: string;
  startTime: string | null;
  endTime: string | null;
  years: number | null;
  span: { index: number; total: number } | null;
  outingStreak: number | null;
};

function eventItems(event: AgendaEvent, from: Date, to: Date): AgendaItem[] {
  const start = parseDay(event.starts_on);
  const end = event.ends_on ? parseDay(event.ends_on) : start;
  const total = daysBetween(start, end) + 1;
  const items: AgendaItem[] = [];

  for (let index = 0; index < total; index++) {
    const date = addDays(start, index);
    if (daysBetween(from, date) < 0 || daysBetween(date, to) < 0) continue;
    const day = toDay(date);
    items.push({
      key: `plan-${event.id}-${day}`,
      kind: 'plan',
      id: event.id,
      title: event.title,
      day,
      startTime: index === 0 ? event.start_time : null,
      endTime: index === total - 1 ? event.end_time : null,
      years: null,
      span: total > 1 ? { index, total } : null,
      outingStreak: event.outing_streak ?? null,
    });
  }

  return items;
}

function specialItems(special: AgendaSpecial, from: Date, to: Date): AgendaItem[] {
  const original = parseDay(special.date);
  const years = special.repeats_yearly
    ? Array.from(
        { length: to.getFullYear() - from.getFullYear() + 1 },
        (_, offset) => from.getFullYear() + offset,
      )
    : [original.getFullYear()];

  return years.flatMap((year) => {
    const lastDay = new Date(year, original.getMonth() + 1, 0).getDate();
    const date = new Date(year, original.getMonth(), Math.min(original.getDate(), lastDay));
    if (daysBetween(from, date) < 0 || daysBetween(date, to) < 0) return [];
    if (special.repeats_yearly && year < original.getFullYear()) return [];
    const day = toDay(date);
    return [
      {
        key: `special-${special.id}-${day}`,
        kind: 'special' as const,
        id: special.id,
        title: special.title,
        day,
        startTime: null,
        endTime: null,
        years: special.repeats_yearly ? year - original.getFullYear() || null : null,
        span: null,
        outingStreak: null,
      },
    ];
  });
}

function compareItems(a: AgendaItem, b: AgendaItem) {
  if (a.day !== b.day) return a.day.localeCompare(b.day);
  if (a.kind !== b.kind) return a.kind === 'special' ? -1 : 1;
  return (a.startTime ?? '').localeCompare(b.startTime ?? '');
}

export function buildAgenda(
  events: AgendaEvent[],
  specials: AgendaSpecial[],
  from: Date,
  to: Date,
): AgendaItem[] {
  return [
    ...events.flatMap((event) => eventItems(event, from, to)),
    ...specials.flatMap((special) => specialItems(special, from, to)),
  ].sort(compareItems);
}

export function groupByDay(items: AgendaItem[]) {
  const groups = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const group = groups.get(item.day);
    if (group) group.push(item);
    else groups.set(item.day, [item]);
  }
  return groups;
}
