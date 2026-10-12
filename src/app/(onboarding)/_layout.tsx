import { Stack } from 'expo-router';

import { colors } from '@/shared/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.background },
        headerTitle: '',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="join" />
    </Stack>
  );
}
