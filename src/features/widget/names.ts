export const WIDGET_NAMES = {
  latestPhoto: 'LatestPhoto',
  daysTogether: 'DaysTogether',
  nextDate: 'NextDate',
} as const;

export type WidgetName = (typeof WIDGET_NAMES)[keyof typeof WIDGET_NAMES];
