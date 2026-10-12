import { supabase } from '@/shared/lib/supabase';

import type { Couple, StartedOnInput } from './types';

export async function getMyCouple(): Promise<Couple | null> {
  const { data, error } = await supabase
    .from('couples')
    .select(
      'id, started_on, invite_code, created_at, members:couple_members(user_id, joined_at, profile:profiles(id, display_name, avatar_path, mood))',
    )
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCouple() {
  const { data, error } = await supabase.rpc('create_couple');
  if (error) throw error;
  return data;
}

export async function joinCouple(code: string) {
  const { data, error } = await supabase.rpc('join_couple', { code });
  if (error) throw error;
  return data;
}

export async function updateStartedOn({ coupleId, startedOn }: StartedOnInput) {
  const { error } = await supabase
    .from('couples')
    .update({ started_on: startedOn })
    .eq('id', coupleId);
  if (error) throw error;
}

export function subscribeToCoupleChanges(coupleId: string, onChange: () => void) {
  const channel = supabase
    .channel(`couple:${coupleId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'couple_members', filter: `couple_id=eq.${coupleId}` },
      onChange,
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
