import { supabase } from '@/shared/lib/supabase';

import type { CalendarEvent, EventChanges, EventDraft, NewEventInput } from './types';

function toColumns(draft: EventDraft) {
  return {
    title: draft.title.trim(),
    details: draft.details.trim(),
    starts_on: draft.startsOn,
    ends_on: draft.endsOn && draft.endsOn !== draft.startsOn ? draft.endsOn : null,
    start_time: draft.startTime,
    end_time: draft.startTime ? draft.endTime : null,
  };
}

export async function listEvents(coupleId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('couple_id', coupleId)
    .order('starts_on')
    .order('start_time', { nullsFirst: true });
  if (error) throw error;
  return data;
}

export async function getEvent(id: string): Promise<CalendarEvent | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createEvent({ coupleId, ...draft }: NewEventInput): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert({ couple_id: coupleId, ...toColumns(draft) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent({ id, ...draft }: EventChanges): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('events')
    .update(toColumns(draft))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToEvents(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const channel = supabase
    .channel(`events:${coupleId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'events', filter },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'events', filter },
      onChange,
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
