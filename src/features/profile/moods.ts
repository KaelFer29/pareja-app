export const MOOD_SUGGESTIONS = [
  { emoji: '😊', text: 'Feliz' },
  { emoji: '🥰', text: 'Con amor' },
  { emoji: '😌', text: 'En calma' },
  { emoji: '😴', text: 'Con sueño' },
  { emoji: '😢', text: 'Triste' },
  { emoji: '😣', text: 'Con estrés' },
] as const;

export const MOOD_TEXT_MAX = 15;

const MOOD_EMOJI_MAX = 8;

const EMOJI_PATTERN =
  /\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})*(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})*)*/gu;

export function lastEmoji(value: string) {
  const matches = value.match(EMOJI_PATTERN) ?? [];
  const valid = matches.filter((emoji) => Array.from(emoji).length <= MOOD_EMOJI_MAX);
  return valid.at(-1) ?? '';
}

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
