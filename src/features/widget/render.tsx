import type { WidgetInfo } from 'react-native-android-widget';

import { getCoupleForWidget, getLatestPhotoForWidget, getNextDateForWidget } from './api';
import { DaysTogetherWidget } from './days-together-widget';
import { LatestPhotoWidget } from './latest-photo-widget';
import { WIDGET_NAMES, type WidgetName } from './names';
import { NextDateWidget } from './next-date-widget';

type WidgetRenderer = (info: WidgetInfo) => Promise<React.JSX.Element>;

export const widgetRenderers: Record<WidgetName, WidgetRenderer> = {
  [WIDGET_NAMES.latestPhoto]: async ({ width, height }) => {
    const photo = await getLatestPhotoForWidget().catch(() => null);
    return <LatestPhotoWidget photo={photo} width={width} height={height} />;
  },
  [WIDGET_NAMES.daysTogether]: async ({ width }) => {
    const couple = await getCoupleForWidget().catch(() => null);
    return <DaysTogetherWidget couple={couple} width={width} />;
  },
  [WIDGET_NAMES.nextDate]: async () => {
    const next = await getNextDateForWidget().catch(() => null);
    return <NextDateWidget next={next} />;
  },
};

export function isWidgetName(name: string): name is WidgetName {
  return name in widgetRenderers;
}
