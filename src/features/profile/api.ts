import { randomUUID } from 'expo-crypto';

import { compressImage } from '@/shared/lib/image';
import { removeFiles, uploadImage } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

import type { Profile, UpdateAvatarInput, UpdateMoodInput, UpdateProfileInput } from './types';

const AVATAR_MAX_SIDE = 512;

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile({ userId, displayName }: UpdateProfileInput) {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateMood({ userId, mood }: UpdateMoodInput) {
  const { error } = await supabase.from('profiles').update({ mood }).eq('id', userId);
  if (error) throw error;
}

export async function updateAvatar({ userId, image, previousPath }: UpdateAvatarInput) {
  const compressed = await compressImage(image, AVATAR_MAX_SIDE);
  const path = `${userId}/${randomUUID().toLowerCase()}.jpg`;

  await uploadImage('avatars', path, compressed.uri);

  const { error } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (error) {
    await removeFiles('avatars', [path]).catch(() => undefined);
    throw error;
  }

  if (previousPath) {
    await removeFiles('avatars', [previousPath]).catch(() => undefined);
  }
}
