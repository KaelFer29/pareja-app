import type { WidgetInfo } from 'react-native-android-widget';

import {
  getCoupleForWidget,
  getLatestPhotoForWidget,
  getNextDateForWidget,
  getUpcomingAgendaForWidget,
} from './api';
import { DaysTogetherWidget } from './days-together-widget';
import { LatestPhotoWidget } from './latest-photo-widget';
import { WIDGET_NAMES, type WidgetName } from './names';
import { NextDateWidget } from './next-date-widget';
import { PLAN_ROW_HEIGHT, PLANS_HEADER_HEIGHT, UpcomingPlansWidget } from './upcoming-plans-widget';

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
  [WIDGET_NAMES.nextDate]: async ({ height }) => {
    const next = await getNextDateForWidget().catch(() => null);
    return <NextDateWidget next={next} height={height} />;
  },
  [WIDGET_NAMES.upcomingPlans]: async ({ height }) => {
    const rows = Math.min(
      Math.max(Math.floor((height - PLANS_HEADER_HEIGHT) / PLAN_ROW_HEIGHT), 1),
      6,
    );
    const items = await getUpcomingAgendaForWidget(rows).catch(() => []);
    return <UpcomingPlansWidget items={items} />;
  },
};

export function isWidgetName(name: string): name is WidgetName {
  return name in widgetRenderers;
}
