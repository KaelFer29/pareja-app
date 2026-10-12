import { Tabs } from 'expo-router';

import { colors } from '@/shared/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="photos" options={{ title: 'Fotos' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notas' }} />
      <Tabs.Screen name="lists" options={{ title: 'Listas' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}
