import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createImportantDate,
  deleteImportantDate,
  getImportantDate,
  listImportantDates,
  updateImportantDate,
} from './api';

export const dateKeys = {
  all: ['important-dates'] as const,
  list: (coupleId: string) => [...dateKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...dateKeys.all, 'detail', id] as const,
};

export function useImportantDates(coupleId: string | undefined) {
  return useQuery({
    queryKey: dateKeys.list(coupleId ?? ''),
    queryFn: () => listImportantDates(coupleId ?? ''),
    enabled: !!coupleId,
  });
}

export function useImportantDate(id: string) {
  return useQuery({
    queryKey: dateKeys.detail(id),
    queryFn: () => getImportantDate(id),
  });
}

export function useCreateImportantDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createImportantDate,
    onSuccess: (item) => {
      queryClient.setQueryData(dateKeys.detail(item.id), item);
      queryClient.invalidateQueries({ queryKey: dateKeys.list(item.couple_id) });
    },
  });
}

export function useUpdateImportantDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateImportantDate,
    onSuccess: (item) => {
      queryClient.setQueryData(dateKeys.detail(item.id), item);
      queryClient.invalidateQueries({ queryKey: dateKeys.list(item.couple_id) });
    },
  });
}

export function useDeleteImportantDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImportantDate,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: dateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dateKeys.all });
    },
  });
}
