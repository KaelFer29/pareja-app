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

export type WidgetNextDate = {
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  years: number | null;
};
