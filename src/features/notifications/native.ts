import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const isNotificationsAvailable =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export const notificationsModule: NotificationsModule | null = isNotificationsAvailable
  ? require('expo-notifications')
  : null;
