import { supabase } from '@/shared/lib/supabase';

import type { NewPlaceInput, Place, PlaceChanges, PlaceDraft } from './types';

function toColumns(draft: PlaceDraft) {
  return {
    name: draft.name.trim(),
    note: draft.note.trim(),
    latitude: draft.latitude,
    longitude: draft.longitude,
    visited_on: draft.visitedOn,
  };
}

export async function listPlaces(coupleId: string): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('couple_id', coupleId)
    .order('visited_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPlace(id: string): Promise<Place | null> {
  const { data, error } = await supabase.from('places').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPlace({ coupleId, ...draft }: NewPlaceInput): Promise<Place> {
  const { data, error } = await supabase
    .from('places')
    .insert({ couple_id: coupleId, ...toColumns(draft) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlace({ id, ...draft }: PlaceChanges): Promise<Place> {
  const { data, error } = await supabase
    .from('places')
    .update(toColumns(draft))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlace(id: string) {
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToPlaces(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const channel = supabase
    .channel(`places:${coupleId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'places', filter },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'places', filter },
      onChange,
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'places' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
