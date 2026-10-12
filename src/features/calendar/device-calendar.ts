import { getCalendars, requestCalendarPermissions } from 'expo-calendar';

import { addDays, parseDay, timeToDate } from '@/shared/utils/date';

import type { CalendarEvent } from './types';

export type DeviceCalendarResult = 'opened' | 'denied' | 'no-calendar';

function eventDates(event: CalendarEvent) {
  const startDay = parseDay(event.starts_on);
  const endDay = event.ends_on ? parseDay(event.ends_on) : startDay;

  if (!event.start_time) {
    return { allDay: true, startDate: startDay, endDate: addDays(endDay, 1) };
  }

  const startDate = timeToDate(event.start_time, startDay);
  const endDate = event.end_time
    ? timeToDate(event.end_time, endDay)
    : new Date(startDate.getTime() + 60 * 60 * 1000);
  return { allDay: false, startDate, endDate };
}

export async function addToDeviceCalendar(event: CalendarEvent): Promise<DeviceCalendarResult> {
  const permission = await requestCalendarPermissions();
  if (!permission.granted) return 'denied';

  const calendars = await getCalendars();
  const writable = calendars.filter((calendar) => calendar.allowsModifications);
  const calendar = writable.find((item) => item.isPrimary) ?? writable[0];
  if (!calendar) return 'no-calendar';

  await calendar.addEventWithForm({
    title: event.title,
    notes: event.details || undefined,
    ...eventDates(event),
  });
  return 'opened';
}
