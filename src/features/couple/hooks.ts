import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCouple, getMyCouple, joinCouple, updateStartedOn } from './api';

export const coupleKeys = {
  all: ['couple'] as const,
  mine: (userId: string) => [...coupleKeys.all, userId] as const,
};

export function useMyCouple(userId: string | null) {
  return useQuery({
    queryKey: coupleKeys.mine(userId ?? ''),
    queryFn: getMyCouple,
    enabled: !!userId,
  });
}

export function useCreateCouple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCouple,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coupleKeys.all }),
  });
}

export function useUpdateStartedOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStartedOn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coupleKeys.all }),
  });
}

export function useJoinCouple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCouple,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coupleKeys.all }),
  });
}
