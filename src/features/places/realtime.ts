import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToPlaces } from './api';
import { placeKeys } from './hooks';

export function usePlacesRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToPlaces(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    });
  }, [coupleId, queryClient]);
}
