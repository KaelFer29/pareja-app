import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Text } from './text';

type ChipProps = {
  label: string;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function Chip({ label, emoji, selected = false, disabled = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text variant="caption" style={selected ? styles.selectedLabel : styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + spacing.xxs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md - spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  emoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  label: {
    color: colors.accent,
  },
  selectedLabel: {
    color: colors.primary,
  },
});
