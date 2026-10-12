import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from './api';

export const eventKeys = {
  all: ['events'] as const,
  list: (coupleId: string) => [...eventKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export function useEvents(coupleId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.list(coupleId ?? ''),
    queryFn: () => listEvents(coupleId as string),
    enabled: !!coupleId,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEvent(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: eventKeys.list(event.couple_id) });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (event) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: eventKeys.list(event.couple_id) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
