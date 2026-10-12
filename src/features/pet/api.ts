import { supabase } from '@/shared/lib/supabase';
import { toDay } from '@/shared/utils/date';

import type { Pet, PetAction } from './types';

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

export function subscribeToPet(coupleId: string, onChange: () => void) {
  const channel = supabase
    .channel(`pets:${coupleId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pets', filter: `couple_id=eq.${coupleId}` },
      onChange,
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
