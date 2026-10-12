import type { Tables } from '@/shared/lib/database.types';

export type CalendarEvent = Tables<'events'>;

export type EventDraft = {
  title: string;
  details: string;
  startsOn: string;
  endsOn: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type NewEventInput = EventDraft & {
  coupleId: string;
};

export type EventChanges = EventDraft & {
  id: string;
};
