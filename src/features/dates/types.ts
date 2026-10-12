import type { Tables } from '@/shared/lib/database.types';
import type { Occurrence } from '@/shared/utils/occurrence';

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

export type UpcomingDate = ImportantDate & {
  occurrence: Occurrence | null;
};
