import { useQuery } from '@tanstack/react-query';

import { createSignedUrl, SIGNED_URL_STALE_MS, type Bucket } from '@/shared/lib/storage';

export function useSignedUrl(bucket: Bucket, path: string | null | undefined) {
  return useQuery({
    queryKey: ['signed-url', bucket, path],
    queryFn: () => createSignedUrl(bucket, path as string),
    enabled: !!path,
    staleTime: SIGNED_URL_STALE_MS,
    gcTime: SIGNED_URL_STALE_MS,
  });
}
