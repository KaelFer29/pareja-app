import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type WidgetRuntime = typeof import('./runtime');

const isWidgetAvailable =
  Platform.OS === 'android' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export const widgetRuntime: WidgetRuntime | null = isWidgetAvailable ? require('./runtime') : null;
