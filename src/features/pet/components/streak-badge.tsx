import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export const OUTING_EVERY = 7;

type StreakProps = {
  streak: number;
  caredToday: boolean;
};

type StreakState = 'active' | 'risk' | 'none';

function streakState({ streak, caredToday }: StreakProps): StreakState {
  if (streak === 0) return 'none';
  return caredToday ? 'active' : 'risk';
}

function days(count: number) {
  return count === 1 ? '1 día' : `${count} días`;
}

export function StreakBadge({ streak, caredToday }: StreakProps) {
  const state = streakState({ streak, caredToday });
  const label = state === 'none' ? 'Sin racha' : days(streak);
  const tint = state === 'none' ? colors.textMuted : colors.streak;

  return (
    <View
      style={[styles.badge, styles[state]]}
      accessibilityLabel={state === 'none' ? 'Sin racha' : `Racha de ${label}`}
    >
      <Icon
        icon={Flame}
        size={15}
        color={tint}
        fill={state === 'active' ? colors.streak : 'none'}
        strokeWidth={state === 'active' ? 2.2 : 2}
      />
      <Text style={[styles.text, { color: state === 'none' ? colors.textMuted : colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

export function streakHint({ streak, caredToday }: StreakProps) {
  if (streak === 0) return 'Cuídenlo hoy para empezar una racha.';
  if (!caredToday) return `Cuídenlo hoy para no perder la racha de ${days(streak)}.`;
  const left = OUTING_EVERY - (streak % OUTING_EVERY);
  if (left === OUTING_EVERY) return `¡Cumplieron ${days(streak)} de racha!`;
  return left === 1
    ? 'Mañana propone una salida si siguen la racha.'
    : `En ${days(left)} propone una salida.`;
}

export function StreakHint(props: StreakProps) {
  const state = streakState(props);
  return (
    <Text
      variant="caption"
      align="center"
      style={state === 'risk' ? styles.riskHint : undefined}
      tone={state === 'risk' ? undefined : 'muted'}
    >
      {streakHint(props)}
    </Text>
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
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  active: {
    backgroundColor: colors.streakSoft,
    borderColor: colors.streak,
  },
  risk: {
    backgroundColor: colors.surface,
    borderColor: colors.streak,
    borderStyle: 'dashed',
  },
  none: {
    backgroundColor: colors.surfaceMuted,
  },
  level: {
    backgroundColor: colors.accentSoft,
  },
  text: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    lineHeight: 16,
  },
  riskHint: {
    color: colors.streak,
    fontFamily: fonts.bold,
  },
});
