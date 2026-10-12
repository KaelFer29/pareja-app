import { supabase } from '@/shared/lib/supabase';

import type { Reaction, ReactionChange, ReactionTarget } from './types';

function targetColumn(target: ReactionTarget) {
  return target.kind === 'photo' ? 'photo_id' : 'note_id';
}

export async function listReactions(target: ReactionTarget): Promise<Reaction[]> {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq(targetColumn(target), target.id)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function changeReaction({ target, emoji, current }: ReactionChange) {
  if (current && current.emoji === emoji) {
    const { error } = await supabase.from('reactions').delete().eq('id', current.id);
    if (error) throw error;
    return;
  }

  if (current) {
    const { error } = await supabase.from('reactions').update({ emoji }).eq('id', current.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('reactions').insert({
    couple_id: target.coupleId,
    photo_id: target.kind === 'photo' ? target.id : null,
    note_id: target.kind === 'note' ? target.id : null,
    emoji,
  });
  if (error) throw error;
}

export function subscribeToReactions(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const channel = supabase
    .channel(`reactions:${coupleId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reactions', filter },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'reactions', filter },
      onChange,
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reactions' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
