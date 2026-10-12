import { supabase } from '@/shared/lib/supabase';

import type { Nudge, SendNudgeInput } from './types';

export async function sendNudge({ coupleId, kind }: SendNudgeInput) {
  const { error } = await supabase.from('nudges').insert({ couple_id: coupleId, kind });
  if (error) throw error;
}

export async function getLastReceivedNudge(
  coupleId: string,
  userId: string,
): Promise<Nudge | null> {
  const { data, error } = await supabase
    .from('nudges')
    .select('*')
    .eq('couple_id', coupleId)
    .neq('sender_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function subscribeToNudges(
  coupleId: string,
  onInsert: (nudge: Nudge) => void,
  onSubscribed: () => void,
) {
  const channel = supabase
    .channel(`nudges:${coupleId}`)
    .on<Nudge>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'nudges', filter: `couple_id=eq.${coupleId}` },
      (payload) => onInsert(payload.new),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onSubscribed();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
