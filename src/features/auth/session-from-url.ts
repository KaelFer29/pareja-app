import * as Linking from 'expo-linking';

import { supabase } from '@/shared/lib/supabase';

function collectParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parsed = Linking.parse(url);

  if (parsed.queryParams) {
    for (const [key, value] of Object.entries(parsed.queryParams)) {
      if (typeof value === 'string') {
        params[key] = value;
      } else if (Array.isArray(value) && typeof value[0] === 'string') {
        params[key] = value[0];
      }
    }
  }

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const hash = url.slice(hashIndex + 1);
    const search = new URLSearchParams(hash.startsWith('?') ? hash.slice(1) : hash);
    search.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
}

export async function createSessionFromUrl(url: string) {
  const params = collectParams(url);
  if (params.error || params.error_code) {
    throw new Error(params.error_description || params.error || params.error_code);
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}

export function isAuthCallbackUrl(url: string) {
  return (
    url.startsWith('pareja://') &&
    (url.includes('access_token') || url.includes('refresh_token') || url.includes('code='))
  );
}
