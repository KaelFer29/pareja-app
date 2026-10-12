import { CircleAlert, Info, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

type NoticeTone = 'danger' | 'info';

type NoticeProps = {
  message: string;
  tone?: NoticeTone;
};

const palette: Record<NoticeTone, { background: string; color: string; icon: LucideIcon }> = {
  danger: { background: colors.dangerSoft, color: colors.danger, icon: CircleAlert },
  info: { background: colors.accentSoft, color: colors.accent, icon: Info },
};

export function Notice({ message, tone = 'danger' }: NoticeProps) {
  const { background, color, icon } = palette[tone];

  return (
    <View
      style={[styles.container, { backgroundColor: background }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
    >
      <Icon icon={icon} size={18} color={color} />
      <Text variant="caption" style={[styles.message, { color }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md - spacing.xs,
    borderRadius: radius.md,
  },
  message: {
    flex: 1,
  },
});
