import { Text } from '@/shared/ui/text';

import { findMood } from '../moods';

type MoodBadgeProps = {
  mood: string | null | undefined;
};

export function MoodBadge({ mood }: MoodBadgeProps) {
  const option = findMood(mood);
  if (!option) return null;

  return (
    <Text tone="muted">
      {option.emoji} {option.label}
    </Text>
  );
}
