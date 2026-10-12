import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

type StreakBadgeProps = {
  streak: number;
  caredToday: boolean;
};

export function StreakBadge({ streak, caredToday }: StreakBadgeProps) {
  const active = streak > 0 && caredToday;
  const label = streak === 1 ? '1 día' : `${streak} días`;

  return (
    <View
      style={[styles.badge, active ? styles.active : styles.idle]}
      accessibilityLabel={`Racha de ${label}`}
    >
      <Icon
        icon={Flame}
        size={14}
        color={active ? colors.primaryText : colors.primary}
        fill={active ? colors.primaryText : 'none'}
        strokeWidth={2.2}
      />
      <Text style={[styles.text, { color: active ? colors.primaryText : colors.primary }]}>
        {label}
      </Text>
    </View>
  );
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <View style={[styles.badge, styles.level]}>
      <Text style={[styles.text, { color: colors.accent }]}>Nivel {level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xxs,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  active: {
    backgroundColor: colors.primary,
  },
  idle: {
    backgroundColor: colors.primarySoft,
  },
  level: {
    backgroundColor: colors.accentSoft,
  },
  text: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    lineHeight: 16,
  },
});
