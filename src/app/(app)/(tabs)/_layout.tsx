import { Tabs } from 'expo-router';
import {
  CalendarDays,
  House,
  Images,
  MapPinned,
  NotebookPen,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { colors } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { ScrollableTabBar } from '@/shared/ui/scrollable-tab-bar';

function tabIcon(icon: LucideIcon) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon icon={icon} size={23} color={color} strokeWidth={focused ? 2.3 : 1.8} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen name="photos" options={{ title: 'Fotos', tabBarIcon: tabIcon(Images) }} />
      <Tabs.Screen name="notes" options={{ title: 'Notas', tabBarIcon: tabIcon(NotebookPen) }} />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendario', tabBarIcon: tabIcon(CalendarDays) }}
      />
      <Tabs.Screen name="places" options={{ title: 'Lugares', tabBarIcon: tabIcon(MapPinned) }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: tabIcon(Settings) }} />
    </Tabs>
  );
}
