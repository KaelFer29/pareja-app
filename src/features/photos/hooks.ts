import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SIGNED_URL_STALE_MS } from '@/shared/lib/storage';

import { deletePhoto, getPhoto, listPhotos, uploadPhoto } from './api';

export const photoKeys = {
  all: ['photos'] as const,
  list: (coupleId: string) => [...photoKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...photoKeys.all, 'detail', id] as const,
};

export function usePhotos(coupleId: string) {
  return useInfiniteQuery({
    queryKey: photoKeys.list(coupleId),
    queryFn: ({ pageParam }) => listPhotos(coupleId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: SIGNED_URL_STALE_MS,
  });
}

export function useLatestPhoto(coupleId: string | undefined) {
  return useInfiniteQuery({
    queryKey: photoKeys.list(coupleId ?? ''),
    queryFn: ({ pageParam }) => listPhotos(coupleId ?? '', pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: SIGNED_URL_STALE_MS,
    enabled: !!coupleId,
    select: (data) => data.pages[0]?.photos[0] ?? null,
  });
}

export function usePhoto(id: string) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => getPhoto(id),
    staleTime: SIGNED_URL_STALE_MS,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: photoKeys.all }),
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: (_data, photo) => {
      queryClient.removeQueries({ queryKey: photoKeys.detail(photo.id) });
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
    },
  });
}
