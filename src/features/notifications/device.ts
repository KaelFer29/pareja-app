import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { colors } from '@/shared/theme';

import { notificationsModule } from './native';

export const DEFAULT_CHANNEL_ID = 'default';

export function configureForegroundNotifications() {
  notificationsModule?.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: true,
    }),
  });
}

export async function getDevicePushToken(): Promise<string | null> {
  const Notifications = notificationsModule;
  if (!Notifications || !Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Pareja',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: colors.primary,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}
