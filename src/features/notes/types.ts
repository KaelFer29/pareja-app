import type { Tables } from '@/shared/lib/database.types';
import type { NoteColor } from '@/shared/theme';

export type Note = Tables<'notes'>;

export type NoteDraft = {
  title: string;
  content: string;
  color: NoteColor;
};

export type NewNoteInput = NoteDraft & {
  coupleId: string;
};

export type NoteChanges = Partial<NoteDraft & { pinned: boolean }> & {
  id: string;
};
