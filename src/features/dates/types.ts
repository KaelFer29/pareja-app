import type { Tables } from '@/shared/lib/database.types';

export type ImportantDate = Tables<'important_dates'>;

export type ImportantDateDraft = {
  title: string;
  date: string;
  repeatsYearly: boolean;
};

export type NewImportantDateInput = ImportantDateDraft & {
  coupleId: string;
};

export type ImportantDateChanges = ImportantDateDraft & {
  id: string;
};

export type Occurrence = {
  date: Date;
  daysLeft: number;
  years: number | null;
};

export type UpcomingDate = ImportantDate & {
  occurrence: Occurrence | null;
};
