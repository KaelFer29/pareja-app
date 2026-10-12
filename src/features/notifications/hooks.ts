import { router, type Href } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken, unregisterPushToken } from './api';
import { getDevicePushToken } from './device';
import { notificationsModule } from './native';

let registeredToken: string | null = null;

export function usePushRegistration(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    getDevicePushToken()
      .then(async (token) => {
        if (!token) return;
        await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
        registeredToken = token;
      })
      .catch((error: unknown) => {
        if (__DEV__) console.warn('[push] No se pudo registrar el token', error);
      });
  }, [userId]);
}

export async function unregisterThisDevice() {
  if (!registeredToken) return;
  const token = registeredToken;
  registeredToken = null;
  await unregisterPushToken(token).catch(() => undefined);
}

function openNotification(response: NotificationResponse | null) {
  const url = response?.notification.request.content.data?.url;
  if (typeof url !== 'string' || !url.startsWith('/')) return;
  notificationsModule?.clearLastNotificationResponse();
  router.push(url as Href);
}

export function useNotificationNavigation() {
  useEffect(() => {
    const Notifications = notificationsModule;
    if (!Notifications) return;

    openNotification(Notifications.getLastNotificationResponse());

    const subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    return () => subscription.remove();
  }, []);
}
