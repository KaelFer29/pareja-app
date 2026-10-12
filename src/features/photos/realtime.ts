import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToPhotos } from './api';
import { photoKeys } from './hooks';

export function usePhotosRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToPhotos(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(coupleId) });
    });
  }, [coupleId, queryClient]);
}
