import type { Tables } from '@/shared/lib/database.types';

export type Note = Tables<'notes'>;

export type NoteDraft = {
  title: string;
  content: string;
};

export type NewNoteInput = NoteDraft & {
  coupleId: string;
};

export type NoteChanges = Partial<NoteDraft & { pinned: boolean }> & {
  id: string;
};
