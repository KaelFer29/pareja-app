import { createSignedUrl } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';
import { startOfToday } from '@/shared/utils/date';
import { sortByUpcoming } from '@/shared/utils/occurrence';

import type { WidgetCouple, WidgetNextDate, WidgetPhoto } from './types';

type CoupleMembers = {
  userId: string;
  startedOn: string | null;
  names: Map<string, string>;
};

async function getCoupleMembers(): Promise<CoupleMembers | null> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('couples')
    .select('started_on, members:couple_members(user_id, profile:profiles(display_name))')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const names = new Map<string, string>();
  for (const member of data.members) {
    if (member.profile?.display_name) names.set(member.user_id, member.profile.display_name);
  }
  return { userId, startedOn: data.started_on, names };
}

export async function getCoupleForWidget(): Promise<WidgetCouple | null> {
  const couple = await getCoupleMembers();
  if (!couple) return null;

  const partnerId = [...couple.names.keys()].find((id) => id !== couple.userId);
  return {
    startedOn: couple.startedOn,
    myName: couple.names.get(couple.userId) ?? 'Tú',
    partnerName: (partnerId && couple.names.get(partnerId)) || 'Tu pareja',
  };
}

export async function getLatestPhotoForWidget(): Promise<WidgetPhoto | null> {
  const couple = await getCoupleMembers();
  if (!couple) return null;

  const { data, error } = await supabase
    .from('photos')
    .select('id, storage_path, caption, created_at, uploaded_by')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const url = await createSignedUrl('photos', data.storage_path);
  if (!url) return null;

  return {
    id: data.id,
    url,
    caption: data.caption,
    authorName: data.uploaded_by ? (couple.names.get(data.uploaded_by) ?? null) : null,
    createdAt: data.created_at,
  };
}

export async function getNextDateForWidget(): Promise<WidgetNextDate | null> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const { data, error } = await supabase
    .from('important_dates')
    .select('id, title, date, repeats_yearly');
  if (error) throw error;

  const [next] = sortByUpcoming(data, startOfToday());
  if (!next?.occurrence) return null;

  return {
    id: next.id,
    title: next.title,
    date: next.occurrence.date,
    daysLeft: next.occurrence.daysLeft,
    years: next.occurrence.years,
  };
}
