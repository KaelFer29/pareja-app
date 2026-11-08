import { notificationsModule } from './native';

function notificationUrl(data: Record<string, unknown> | undefined) {
  const url = data?.url;
  return typeof url === 'string' ? url : null;
}

function urlsMatch(presentedUrl: string, currentPath: string) {
  if (presentedUrl === currentPath) return true;
  if (currentPath === '/' || currentPath === '') {
    return presentedUrl === '/' || presentedUrl === '';
  }
  return presentedUrl === currentPath || presentedUrl.startsWith(`${currentPath}?`);
}

export async function dismissNotificationById(identifier: string) {
  const Notifications = notificationsModule;
  if (!Notifications) return;
  await Notifications.dismissNotificationAsync(identifier).catch(() => undefined);
}

export async function dismissNotificationsForPath(path: string) {
  const Notifications = notificationsModule;
  if (!Notifications) return;

  const presented = await Notifications.getPresentedNotificationsAsync().catch(() => []);
  await Promise.all(
    presented.map(async (item) => {
      const url = notificationUrl(item.request.content.data as Record<string, unknown> | undefined);
      if (!url || !urlsMatch(url, path)) return;
      await Notifications.dismissNotificationAsync(item.request.identifier).catch(() => undefined);
    }),
  );
}
