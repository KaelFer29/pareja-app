import { createSignedUrl } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';
import { buildAgenda } from '@/shared/utils/agenda';
import { addDays, daysBetween, parseDay, startOfToday, toDay } from '@/shared/utils/date';
import { sortByUpcoming } from '@/shared/utils/occurrence';
import { getPetStats } from '@/shared/utils/pet';

import type {
  WidgetAgendaItem,
  WidgetCouple,
  WidgetNextDate,
  WidgetPet,
  WidgetPhoto,
} from './types';

const AGENDA_DAYS = 60;

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

export async function getPetForWidget(): Promise<WidgetPet | null> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return null;

  const { data, error } = await supabase.from('pets').select('*').maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const stats = getPetStats(data);
  return {
    name: data.name,
    mood: stats.mood,
    stage: stats.stage,
    level: stats.level,
    streak: stats.streak,
    caredToday: stats.caredToday,
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

export async function getUpcomingAgendaForWidget(limit: number): Promise<WidgetAgendaItem[]> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return [];

  const today = startOfToday();
  const until = addDays(today, AGENDA_DAYS);

  const [events, specials] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, starts_on, ends_on, start_time, end_time')
      .or(`ends_on.gte.${toDay(today)},starts_on.gte.${toDay(today)}`)
      .lte('starts_on', toDay(until)),
    supabase.from('important_dates').select('id, title, date, repeats_yearly'),
  ]);
  if (events.error) throw events.error;
  if (specials.error) throw specials.error;

  const seen = new Set<string>();
  const items: WidgetAgendaItem[] = [];

  for (const item of buildAgenda(events.data, specials.data, today, until)) {
    if (item.kind === 'plan' && seen.has(item.id)) continue;
    seen.add(item.id);
    const date = parseDay(item.day);
    items.push({
      key: item.key,
      kind: item.kind,
      id: item.id,
      title: item.title,
      date,
      daysLeft: daysBetween(today, date),
      startTime: item.startTime,
      endTime: item.endTime,
      years: item.years,
    });
    if (items.length >= limit) break;
  }

  return items;
}
