import { supabase } from '@/shared/lib/supabase';
import { toDay } from '@/shared/utils/date';

import type { Pet, PetAction, PetOuting } from './types';

export async function getPet(coupleId: string): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adoptPet(name: string): Promise<Pet> {
  const { data, error } = await supabase.rpc('adopt_pet', { pet_name: name.trim() });
  if (error) throw error;
  return data;
}

export async function careForPet(action: PetAction): Promise<Pet> {
  const { data, error } = await supabase.rpc('care_for_pet', {
    action,
    local_day: toDay(new Date()),
  });
  if (error) throw error;
  return data;
}

export async function renamePet({ coupleId, name }: { coupleId: string; name: string }) {
  const { data, error } = await supabase
    .from('pets')
    .update({ name: name.trim() })
    .eq('couple_id', coupleId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingOuting(coupleId: string): Promise<PetOuting | null> {
  const { data, error } = await supabase
    .from('pet_outings')
    .select('*, idea:outing_ideas(*)')
    .eq('couple_id', coupleId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function scheduleOuting({ outingId, day }: { outingId: string; day: string }) {
  const { data, error } = await supabase.rpc('schedule_outing', {
    outing_id: outingId,
    outing_day: day,
  });
  if (error) throw error;
  return data;
}

export async function dismissOuting(outingId: string) {
  const { error } = await supabase.rpc('dismiss_outing', { outing_id: outingId });
  if (error) throw error;
}

export function subscribeToPet(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const channel = supabase
    .channel(`pets:${coupleId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pets', filter }, onChange)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pet_outings', filter },
      onChange,
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
