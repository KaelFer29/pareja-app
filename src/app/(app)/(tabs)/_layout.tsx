import { Tabs } from 'expo-router';
import {
  House,
  Images,
  ListChecks,
  NotebookPen,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { colors, fonts, shadows } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';

function tabIcon(icon: LucideIcon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon icon={icon} size={23} color={color} strokeWidth={focused ? 2.3 : 1.8} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...shadows.card,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen name="photos" options={{ title: 'Fotos', tabBarIcon: tabIcon(Images) }} />
      <Tabs.Screen name="notes" options={{ title: 'Notas', tabBarIcon: tabIcon(NotebookPen) }} />
      <Tabs.Screen name="lists" options={{ title: 'Listas', tabBarIcon: tabIcon(ListChecks) }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: tabIcon(Settings) }} />
    </Tabs>
  );
}
