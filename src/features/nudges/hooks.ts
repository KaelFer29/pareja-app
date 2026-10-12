import { useMutation, useQuery } from '@tanstack/react-query';

import { getLastReceivedNudge, sendNudge } from './api';

export const nudgeKeys = {
  all: ['nudges'] as const,
  lastReceived: (coupleId: string, userId: string) =>
    [...nudgeKeys.all, 'last-received', coupleId, userId] as const,
};

export function useLastReceivedNudge(coupleId: string, userId: string) {
  return useQuery({
    queryKey: nudgeKeys.lastReceived(coupleId, userId),
    queryFn: () => getLastReceivedNudge(coupleId, userId),
  });
}

export function useSendNudge() {
  return useMutation({ mutationFn: sendNudge });
}
