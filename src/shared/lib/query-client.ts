import { focusManager, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

function logError(kind: string, error: unknown) {
  if (!__DEV__) return;
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
  console.warn(`[${kind}] ${detail}`, error);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => logError('query', error) }),
  mutationCache: new MutationCache({ onError: (error) => logError('mutation', error) }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    focusManager.setFocused(state === 'active');
  });
}
