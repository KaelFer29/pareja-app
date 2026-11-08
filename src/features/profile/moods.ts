export const MOOD_SUGGESTIONS = [
  { emoji: '😊', text: 'Feliz' },
  { emoji: '🥰', text: 'Con amor' },
  { emoji: '😌', text: 'En calma' },
  { emoji: '😴', text: 'Con sueño' },
  { emoji: '😢', text: 'Triste' },
  { emoji: '😣', text: 'Con estrés' },
] as const;

export const MOOD_TEXT_MAX = 15;

export function hasMood(emoji: string | null | undefined, text?: string | null) {
  return !!emoji || !!text?.trim();
}

export function moodLabel(emoji: string | null | undefined, text: string | null | undefined) {
  const trimmed = text?.trim() ?? '';
  if (emoji && trimmed) return `${emoji} ${trimmed}`;
  if (emoji) return emoji;
  if (trimmed) return trimmed;
  return null;
}
