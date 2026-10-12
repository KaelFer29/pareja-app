export type WidgetPhoto = {
  id: string;
  url: string;
  caption: string | null;
  authorName: string | null;
  createdAt: string;
};

export type WidgetCouple = {
  startedOn: string | null;
  myName: string;
  partnerName: string;
};

export type WidgetAgendaItem = {
  key: string;
  kind: 'plan' | 'special';
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  startTime: string | null;
  endTime: string | null;
  years: number | null;
};

export type WidgetNextDate = {
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  years: number | null;
};
