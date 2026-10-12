import type { NudgeKind } from './types';

export const NUDGE_KINDS: { value: NudgeKind; emoji: string; label: string }[] = [
  { value: 'thinking_of_you', emoji: '💭', label: 'Pienso en ti' },
  { value: 'miss_you', emoji: '🥺', label: 'Te extraño' },
  { value: 'love_you', emoji: '❤️', label: 'Te amo' },
  { value: 'hug', emoji: '🤗', label: 'Un abrazo' },
];

export function describeNudge(kind: string) {
  const option = NUDGE_KINDS.find((item) => item.value === kind);
  return option ? `${option.emoji} ${option.label}` : 'Un toque';
}
