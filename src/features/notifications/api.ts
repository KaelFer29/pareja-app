import { supabase } from '@/shared/lib/supabase';

import type { PushPlatform } from './types';

export async function registerPushToken(token: string, platform: PushPlatform) {
  const { error } = await supabase.rpc('register_push_token', {
    new_token: token,
    new_platform: platform,
  });
  if (error) throw error;
}

export async function unregisterPushToken(token: string) {
  const { error } = await supabase.from('push_tokens').delete().eq('token', token);
  if (error) throw error;
}
