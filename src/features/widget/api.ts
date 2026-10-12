import { createSignedUrl } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

import type { WidgetPhoto } from './types';

export async function getLatestPhotoForWidget(): Promise<WidgetPhoto | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase
    .from('photos')
    .select('id, storage_path, caption')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const url = await createSignedUrl('photos', data.storage_path);
  if (!url) return null;

  return { id: data.id, url, caption: data.caption };
}
