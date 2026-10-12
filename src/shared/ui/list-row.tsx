import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

type ListRowProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: 'default' | 'danger';
  showChevron?: boolean;
  onPress: () => void;
};

export function ListRow({
  icon,
  title,
  description,
  tone = 'default',
  showChevron = true,
  onPress,
}: ListRowProps) {
  const isDanger = tone === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, isDanger && styles.iconBoxDanger]}>
        <Icon icon={icon} size={19} color={isDanger ? colors.danger : colors.accent} />
      </View>
      <View style={styles.texts}>
        <Text variant="bodyStrong" tone={isDanger ? 'danger' : 'default'}>
          {title}
        </Text>
        {description && (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        )}
      </View>
      {showChevron && <Icon icon={ChevronRight} size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.6,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDanger: {
    backgroundColor: colors.dangerSoft,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
