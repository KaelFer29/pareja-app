import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { moodLabel } from '../moods';

type MoodBadgeProps = {
  emoji: string | null | undefined;
  text: string | null | undefined;
  name: string;
};

export function MoodBadge({ emoji, text, name }: MoodBadgeProps) {
  const label = moodLabel(emoji, text);

  return (
    <View style={styles.badge}>
      <Text variant="caption" tone={label ? 'accent' : 'muted'}>
        {label ? `${name} está ${label}` : `${name} aún no comparte cómo se siente`}
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
