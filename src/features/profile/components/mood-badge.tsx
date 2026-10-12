import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { findMood } from '../moods';

type MoodBadgeProps = {
  mood: string | null | undefined;
  name: string;
};

export function MoodBadge({ mood, name }: MoodBadgeProps) {
  const option = findMood(mood);

  return (
    <View style={styles.badge}>
      <Text variant="caption" tone={option ? 'accent' : 'muted'}>
        {option
          ? `${name} está ${option.emoji} ${option.label.toLowerCase()}`
          : `${name} aún no comparte cómo se siente`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingVertical: spacing.xs + spacing.xxs,
    paddingHorizontal: spacing.md - spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
});
