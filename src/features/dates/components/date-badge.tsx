import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/shared/theme';
import { Text } from '@/shared/ui/text';
import { formatMonthShort } from '@/shared/utils/date';

type DateBadgeProps = {
  date: Date;
  highlighted?: boolean;
  muted?: boolean;
};

export function DateBadge({ date, highlighted = false, muted = false }: DateBadgeProps) {
  const background = highlighted ? colors.primary : muted ? colors.surfaceMuted : colors.accentSoft;
  const dayColor = highlighted ? colors.primaryText : muted ? colors.textMuted : colors.accent;
  const monthColor = highlighted ? colors.primaryText : muted ? colors.textMuted : colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.month, { color: monthColor }]}>{formatMonthShort(date)}</Text>
      <Text style={[styles.day, { color: dayColor }]}>{date.getDate()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 52,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  day: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    lineHeight: 26,
  },
});
