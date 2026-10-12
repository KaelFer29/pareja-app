import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProfile, updateAvatar, updateMood, updateProfile } from './api';
import type { Profile } from './types';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getProfile(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (_data, { userId }) =>
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) }),
  });
}

export function useUpdateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMood,
    onMutate: ({ userId, mood }) => {
      queryClient.setQueryData<Profile>(profileKeys.detail(userId), (profile) =>
        profile ? { ...profile, mood } : profile,
      );
    },
    onSettled: (_data, _error, { userId }) =>
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) }),
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: (_data, { userId }) =>
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) }),
  });
}
