import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { subscribeToNudges } from './api';
import { nudgeKeys } from './hooks';
import type { Nudge } from './types';

export function useNudgesRealtime(
  coupleId: string | undefined,
  userId: string | undefined,
  onReceive: (nudge: Nudge) => void,
) {
  const queryClient = useQueryClient();
  const onReceiveRef = useRef(onReceive);

  useEffect(() => {
    onReceiveRef.current = onReceive;
  }, [onReceive]);

  useEffect(() => {
    if (!coupleId || !userId) return;

    const refresh = () => queryClient.invalidateQueries({ queryKey: nudgeKeys.all });

    return subscribeToNudges(
      coupleId,
      (nudge) => {
        if (nudge.sender_id === userId) return;
        refresh();
        onReceiveRef.current(nudge);
      },
      refresh,
    );
  }, [coupleId, userId, queryClient]);
}
