import type { Mood } from './types';

export const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'happy', emoji: '😊', label: 'Feliz' },
  { value: 'loving', emoji: '🥰', label: 'Con amor' },
  { value: 'calm', emoji: '😌', label: 'En calma' },
  { value: 'tired', emoji: '😴', label: 'Con sueño' },
  { value: 'sad', emoji: '😢', label: 'Triste' },
  { value: 'stressed', emoji: '😣', label: 'Con estrés' },
];

export function findMood(value: string | null | undefined) {
  return MOODS.find((mood) => mood.value === value) ?? null;
}
