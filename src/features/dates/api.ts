import { supabase } from '@/shared/lib/supabase';

import type { ImportantDate, ImportantDateChanges, NewImportantDateInput } from './types';

export async function listImportantDates(coupleId: string): Promise<ImportantDate[]> {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('couple_id', coupleId)
    .order('date');
  if (error) throw error;
  return data;
}

export async function getImportantDate(id: string): Promise<ImportantDate | null> {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createImportantDate({
  coupleId,
  title,
  date,
  repeatsYearly,
}: NewImportantDateInput): Promise<ImportantDate> {
  const { data, error } = await supabase
    .from('important_dates')
    .insert({ couple_id: coupleId, title: title.trim(), date, repeats_yearly: repeatsYearly })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateImportantDate({
  id,
  title,
  date,
  repeatsYearly,
}: ImportantDateChanges): Promise<ImportantDate> {
  const { data, error } = await supabase
    .from('important_dates')
    .update({ title: title.trim(), date, repeats_yearly: repeatsYearly })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteImportantDate(id: string) {
  const { error } = await supabase.from('important_dates').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToImportantDates(coupleId: string, onChange: () => void) {
  const filter = `couple_id=eq.${coupleId}`;
  const table = 'important_dates';
  const channel = supabase
    .channel(`important_dates:${coupleId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, onChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
