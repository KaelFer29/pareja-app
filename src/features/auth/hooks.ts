import { useMutation, useQueryClient } from '@tanstack/react-query';

import { requestPasswordReset, signIn, signOut, signUp, updateEmail, updatePassword } from './api';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useUpdatePassword() {
  return useMutation({ mutationFn: updatePassword });
}

export function useUpdateEmail() {
  return useMutation({ mutationFn: updateEmail });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.clear(),
  });
}
