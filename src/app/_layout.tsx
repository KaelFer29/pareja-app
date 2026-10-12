import { Caveat_600SemiBold, Caveat_700Bold } from '@expo-google-fonts/caveat';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { CoupleProvider, useCouple } from '@/features/couple/couple-provider';
import { configureForegroundNotifications } from '@/features/notifications/device';
import { queryClient } from '@/shared/lib/query-client';
import { colors } from '@/shared/theme';

configureForegroundNotifications();
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const [fontsLoaded, fontsError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Caveat_600SemiBold,
    Caveat_700Bold,
  });
  const isReady = !isLoading && (fontsLoaded || !!fontsError);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
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
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
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
