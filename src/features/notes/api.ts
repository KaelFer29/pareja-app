import { supabase } from '@/shared/lib/supabase';

import type { NewNoteInput, Note, NoteChanges } from './types';

export async function listNotes(coupleId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('couple_id', coupleId)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createNote({ coupleId, title, content, color }: NewNoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({ couple_id: coupleId, title: title.trim(), content: content.trim(), color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote({
  id,
  title,
  content,
  color,
  pinned,
}: NoteChanges): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ title: title?.trim(), content: content?.trim(), color, pinned })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToNotes(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const channel = supabase
    .channel(`notes:${coupleId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes', filter }, onChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes', filter }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
