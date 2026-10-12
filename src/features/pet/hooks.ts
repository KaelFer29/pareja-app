import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  adoptPet,
  careForPet,
  dismissOuting,
  getPendingOuting,
  getPet,
  renamePet,
  scheduleOuting,
} from './api';
import type { Pet } from './types';

export const petKeys = {
  all: ['pet'] as const,
  detail: (coupleId: string) => [...petKeys.all, coupleId] as const,
  outing: (coupleId: string) => [...petKeys.all, 'outing', coupleId] as const,
};

const EVENTS_KEY = ['events'];

export function usePendingOuting(coupleId: string | undefined) {
  return useQuery({
    queryKey: petKeys.outing(coupleId ?? ''),
    queryFn: () => getPendingOuting(coupleId as string),
    enabled: !!coupleId,
  });
}

export function useScheduleOuting(coupleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleOuting,
    onSuccess: () => {
      queryClient.setQueryData(petKeys.outing(coupleId), null);
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
    },
  });
}

export function useDismissOuting(coupleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissOuting,
    onSuccess: () => queryClient.setQueryData(petKeys.outing(coupleId), null),
  });
}

export function usePet(coupleId: string | undefined) {
  return useQuery({
    queryKey: petKeys.detail(coupleId ?? ''),
    queryFn: () => getPet(coupleId as string),
    enabled: !!coupleId,
  });
}

function useSetPet() {
  const queryClient = useQueryClient();
  return (pet: Pet) => queryClient.setQueryData(petKeys.detail(pet.couple_id), pet);
}

export function useAdoptPet() {
  const setPet = useSetPet();
  return useMutation({ mutationFn: adoptPet, onSuccess: setPet });
}

export function useCareForPet() {
  const setPet = useSetPet();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: careForPet,
    onSuccess: (pet) => {
      setPet(pet);
      if (pet.streak > 0 && pet.streak % 7 === 0) {
        queryClient.invalidateQueries({ queryKey: petKeys.outing(pet.couple_id) });
      }
    },
  });
}

export function useRenamePet() {
  const setPet = useSetPet();
  return useMutation({ mutationFn: renamePet, onSuccess: setPet });
}

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
