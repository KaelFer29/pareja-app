import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToCoupleChanges } from './api';
import { coupleKeys } from './hooks';

export function useCoupleRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToCoupleChanges(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: coupleKeys.all });
    });
  }, [coupleId, queryClient]);
}
