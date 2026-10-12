import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToEvents } from './api';
import { eventKeys } from './hooks';

export function useEventsRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToEvents(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    });
  }, [coupleId, queryClient]);
}
