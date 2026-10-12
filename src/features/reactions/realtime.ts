import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToReactions } from './api';
import { reactionKeys } from './hooks';

export function useReactionsRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToReactions(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: reactionKeys.all });
    });
  }, [coupleId, queryClient]);
}
