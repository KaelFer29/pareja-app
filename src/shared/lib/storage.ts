import { File } from 'expo-file-system';
import { Image } from 'expo-image';

import { supabase } from './supabase';

export type Bucket = 'photos' | 'avatars';

const SIGNED_URL_SECONDS = 60 * 60;

export async function uploadImage(bucket: Bucket, path: string, localUri: string) {
  const body = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw error;
  await Image.writeToCacheAsync(localUri, path).catch(() => undefined);
}

export async function removeFiles(bucket: Bucket, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function createSignedUrls(
  bucket: Bucket,
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) throw error;

  const urls: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
  }
  return urls;
}

export async function createSignedUrl(bucket: Bucket, path: string) {
  const urls = await createSignedUrls(bucket, [path]);
  return urls[path] ?? null;
}

export const SIGNED_URL_STALE_MS = (SIGNED_URL_SECONDS - 10 * 60) * 1000;
