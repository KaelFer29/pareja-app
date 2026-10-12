import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToPet } from './api';
import { petKeys } from './hooks';

export function usePetRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToPet(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all });
    });
  }, [coupleId, queryClient]);
}
