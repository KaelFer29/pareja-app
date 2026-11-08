import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { supabase } from '@/shared/lib/supabase';

import { AUTH_EMAIL_CONFIRMED_URL, AUTH_RESET_PASSWORD_URL } from './redirect';
import type {
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  SignUpResult,
  UpdateEmailInput,
  UpdatePasswordInput,
} from './types';

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToSession(
  onChange: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => onChange(event, session));
  return () => data.subscription.unsubscribe();
}

export async function signIn({ email, password }: SignInInput) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp({ email, password, displayName }: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return { needsEmailConfirmation: !data.session };
}

export async function requestPasswordReset({ email }: ResetPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: AUTH_RESET_PASSWORD_URL,
  });
  if (error) throw error;
}

export async function updatePassword({ password }: UpdatePasswordInput) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function updateEmail({ email }: UpdateEmailInput) {
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: AUTH_EMAIL_CONFIRMED_URL },
  );
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
