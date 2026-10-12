import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { adoptPet, careForPet, getPet, renamePet } from './api';
import type { Pet } from './types';

export const petKeys = {
  all: ['pet'] as const,
  detail: (coupleId: string) => [...petKeys.all, coupleId] as const,
};

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
  return useMutation({ mutationFn: careForPet, onSuccess: setPet });
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
