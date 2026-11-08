import 'react-native-gesture-handler';
import 'expo-router/entry';

import { widgetRuntime } from '@/features/widget/native';

widgetRuntime?.registerWidgets();
