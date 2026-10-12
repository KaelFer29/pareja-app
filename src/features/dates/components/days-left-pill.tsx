import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { formatDaysLeft } from '@/shared/utils/occurrence';

type DaysLeftPillProps = {
  daysLeft: number;
};

export function DaysLeftPill({ daysLeft }: DaysLeftPillProps) {
  const isSoon = daysLeft <= 7;

  return (
    <View style={[styles.pill, isSoon && styles.soon]}>
      <Text variant="caption" tone={isSoon ? 'inverse' : 'primary'}>
        {formatDaysLeft(daysLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: spacing.xxs + spacing.xxs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  soon: {
    backgroundColor: colors.primary,
  },
});
