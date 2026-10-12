import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeToNotes } from './api';
import { noteKeys } from './hooks';

export function useNotesRealtime(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleId) return;

    return subscribeToNotes(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    });
  }, [coupleId, queryClient]);
}
