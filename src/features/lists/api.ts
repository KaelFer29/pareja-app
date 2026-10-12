import { supabase } from '@/shared/lib/supabase';

import type {
  List,
  ListItem,
  ListSummary,
  NewItemInput,
  NewListInput,
  RenameListInput,
  ToggleItemInput,
} from './types';

export async function listLists(coupleId: string): Promise<ListSummary[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*, items:list_items(done)')
    .eq('couple_id', coupleId)
    .order('created_at');
  if (error) throw error;

  return data.map(({ items, ...list }) => ({
    ...list,
    total: items.length,
    done: items.filter((item) => item.done).length,
  }));
}

export async function getList(id: string): Promise<List | null> {
  const { data, error } = await supabase.from('lists').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createList({ coupleId, title }: NewListInput): Promise<List> {
  const { data, error } = await supabase
    .from('lists')
    .insert({ couple_id: coupleId, title: title.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameList({ id, title }: RenameListInput) {
  const { error } = await supabase.from('lists').update({ title: title.trim() }).eq('id', id);
  if (error) throw error;
}

export async function deleteList(id: string) {
  const { error } = await supabase.from('lists').delete().eq('id', id);
  if (error) throw error;
}

export async function listItems(listId: string): Promise<ListItem[]> {
  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function addItem({ listId, coupleId, content }: NewItemInput) {
  const { error } = await supabase
    .from('list_items')
    .insert({ list_id: listId, couple_id: coupleId, content: content.trim() });
  if (error) throw error;
}

export async function toggleItem({ id, done }: ToggleItemInput) {
  const { error } = await supabase.from('list_items').update({ done }).eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('list_items').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToLists(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  let channel = supabase.channel(`lists:${coupleId}`);

  for (const table of ['lists', 'list_items']) {
    channel = channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, onChange)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, onChange)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, onChange);
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') onChange();
  });

  return () => {
    supabase.removeChannel(channel);
  };
}
