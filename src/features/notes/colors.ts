import { noteColors, type NoteColor } from '@/shared/theme';

export const NOTE_COLOR_KEYS = Object.keys(noteColors) as NoteColor[];

export const COLOR_LABELS: Record<NoteColor, string> = {
  yellow: 'Amarillo',
  pink: 'Rosado',
  peach: 'Durazno',
  mint: 'Menta',
  lilac: 'Lila',
  sky: 'Celeste',
};

export function isNoteColor(value: string): value is NoteColor {
  return value in noteColors;
}

export function noteColorOf(note: { color: string }): NoteColor {
  return isNoteColor(note.color) ? note.color : 'yellow';
}
