import type { WidgetInfo } from 'react-native-android-widget';

import { getLatestPhotoForWidget } from './api';
import { LatestPhotoWidget } from './latest-photo-widget';

export async function renderLatestPhotoWidget({ width, height }: WidgetInfo) {
  const photo = await getLatestPhotoForWidget().catch(() => null);
  return <LatestPhotoWidget photo={photo} width={width} height={height} />;
}
