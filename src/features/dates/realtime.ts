import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToImportantDates } from './api';
import { dateKeys } from './hooks';

export function useImportantDatesRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToImportantDates(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: dateKeys.all });
    });
  }, [coupleId, queryClient]);
}
