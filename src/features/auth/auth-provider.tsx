import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { getSession, subscribeToSession } from './api';
import { createSessionFromUrl, isAuthCallbackUrl } from './session-from-url';

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
      if (!url || !isAuthCallbackUrl(url)) return;
      try {
        await createSessionFromUrl(url);
        if (url.includes('reset-password') || url.includes('type=recovery')) {
          setIsPasswordRecovery(true);
          router.replace(RESET_PASSWORD_HREF);
        }
      } catch {
        // El flujo de auth sigue con la sesión actual si el enlace falló.
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
