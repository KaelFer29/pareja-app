import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { CoupleProvider, useCouple } from '@/features/couple/couple-provider';
import { configureForegroundNotifications } from '@/features/notifications/device';
import { queryClient } from '@/shared/lib/query-client';

configureForegroundNotifications();

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <CoupleProvider userId={session?.user.id ?? null}>
      <Routes hasSession={!!session} />
    </CoupleProvider>
  );
}

function Routes({ hasSession }: { hasSession: boolean }) {
  const { isComplete, isLoading } = useCouple();

  if (hasSession && isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasSession && isComplete}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={hasSession && !isComplete}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
