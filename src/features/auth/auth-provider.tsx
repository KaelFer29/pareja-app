import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { getSession, subscribeToSession } from './api';
import { createSessionFromUrl, isAuthCallbackUrl, isResetPasswordUrl } from './session-from-url';

const RESET_PASSWORD_HREF = '/auth/reset-password' as Href;

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));

    return subscribeToSession((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        router.replace(RESET_PASSWORD_HREF);
      }
      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }
    });
  }, []);

  useEffect(() => {
    async function handleUrl(url: string | null) {
      if (!url) return;

      if (isAuthCallbackUrl(url)) {
        try {
          await createSessionFromUrl(url);
          if (isResetPasswordUrl(url)) {
            setIsPasswordRecovery(true);
            router.replace(RESET_PASSWORD_HREF);
          }
        } catch {
          if (isResetPasswordUrl(url)) {
            setIsPasswordRecovery(true);
            router.replace(RESET_PASSWORD_HREF);
          }
        }
        return;
      }

      if (isResetPasswordUrl(url)) {
        setIsPasswordRecovery(true);
        router.replace(RESET_PASSWORD_HREF);
      }
    }

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
