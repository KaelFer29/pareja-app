import { useMutation, useQueryClient } from '@tanstack/react-query';

import { signIn, signOut, signUp } from './api';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.clear(),
  });
}
