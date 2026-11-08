import { supabase } from '@/shared/lib/supabase';

export const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;
export const STORAGE_WARN_RATIO = 0.8;

export async function getStorageUsage(): Promise<number> {
  const { data, error } = await supabase.rpc('storage_usage');
  if (error) throw error;
  return data ?? 0;
}

export function formatStorageBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  }
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  }
  return `${(mb / 1024).toFixed(2)} GB`;
}
