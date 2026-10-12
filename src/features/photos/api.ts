import { randomUUID } from 'expo-crypto';

import { compressImage } from '@/shared/lib/image';
import { createSignedUrls, removeFiles, uploadImage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

import type { NewPhotoInput, Photo, PhotoPage, PhotoRow } from './types';

const PAGE_SIZE = 30;
const MAX_SIDE = 1600;

async function withUrls(rows: PhotoRow[]): Promise<Photo[]> {
  const urls = await createSignedUrls(
    'photos',
    rows.map((row) => row.storage_path),
  );
  return rows.map((row) => ({ ...row, url: urls[row.storage_path] ?? null }));
}

export async function listPhotos(coupleId: string, cursor: string | null): Promise<PhotoPage> {
  let query = supabase
    .from('photos')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) throw error;

  const lastPhoto = data.at(-1);
  return {
    photos: await withUrls(data),
    nextCursor: data.length === PAGE_SIZE && lastPhoto ? lastPhoto.created_at : null,
  };
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const { data, error } = await supabase.from('photos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [photo] = await withUrls([data]);
  return photo;
}

export async function uploadPhoto({ coupleId, image, caption }: NewPhotoInput) {
  const compressed = await compressImage(image, MAX_SIDE);
  const id = randomUUID().toLowerCase();
  const storagePath = `${coupleId}/${id}.jpg`;

  await uploadImage('photos', storagePath, compressed.uri);

  const { error } = await supabase.from('photos').insert({
    id,
    couple_id: coupleId,
    storage_path: storagePath,
    caption: caption.trim() || null,
    width: compressed.width,
    height: compressed.height,
  });

  if (error) {
    await removeFiles('photos', [storagePath]).catch(() => undefined);
    throw error;
  }
}

export async function deletePhoto(photo: Pick<PhotoRow, 'id' | 'storage_path'>) {
  await removeFiles('photos', [photo.storage_path]);
  const { error } = await supabase.from('photos').delete().eq('id', photo.id);
  if (error) throw error;
}

export function subscribeToPhotos(coupleId: string, onChange: () => void) {
  const channel = supabase
    .channel(`photos:${coupleId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
      onChange,
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
