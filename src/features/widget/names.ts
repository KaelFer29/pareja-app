export const WIDGET_NAMES = {
  latestPhoto: 'LatestPhoto',
  daysTogether: 'DaysTogether',
  nextDate: 'NextDate',
  upcomingPlans: 'UpcomingPlans',
} as const;

export type WidgetName = (typeof WIDGET_NAMES)[keyof typeof WIDGET_NAMES];
