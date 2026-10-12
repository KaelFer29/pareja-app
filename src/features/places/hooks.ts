import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPlace, deletePlace, getPlace, listPlaces, updatePlace } from './api';

export const placeKeys = {
  all: ['places'] as const,
  list: (coupleId: string) => [...placeKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...placeKeys.all, 'detail', id] as const,
};

export function usePlaces(coupleId: string | undefined) {
  return useQuery({
    queryKey: placeKeys.list(coupleId ?? ''),
    queryFn: () => listPlaces(coupleId as string),
    enabled: !!coupleId,
  });
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: () => getPlace(id),
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlace,
    onSuccess: (place) => {
      queryClient.setQueryData(placeKeys.detail(place.id), place);
      queryClient.invalidateQueries({ queryKey: placeKeys.list(place.couple_id) });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlace,
    onSuccess: (place) => {
      queryClient.setQueryData(placeKeys.detail(place.id), place);
      queryClient.invalidateQueries({ queryKey: placeKeys.list(place.couple_id) });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlace,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: placeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: placeKeys.all });
    },
  });
}
