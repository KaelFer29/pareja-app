import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken, unregisterPushToken } from './api';
import { getDevicePushToken } from './device';

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

function openNotification(response: Notifications.NotificationResponse | null) {
  const url = response?.notification.request.content.data?.url;
  if (typeof url !== 'string' || !url.startsWith('/')) return;
  Notifications.clearLastNotificationResponse();
  router.push(url as Href);
}

export function useNotificationNavigation() {
  useEffect(() => {
    openNotification(Notifications.getLastNotificationResponse());

    const subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
    return () => subscription.remove();
  }, []);
}
