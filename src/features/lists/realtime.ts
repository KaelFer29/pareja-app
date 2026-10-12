import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToLists } from './api';
import { listKeys } from './hooks';

export function useListsRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToLists(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    });
  }, [coupleId, queryClient]);
}
