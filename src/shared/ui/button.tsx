import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
};

const palette: Record<ButtonVariant, { background: string; pressed: string; content: string }> = {
  primary: {
    background: colors.primary,
    pressed: colors.primaryPressed,
    content: colors.primaryText,
  },
  secondary: { background: colors.accentSoft, pressed: colors.border, content: colors.accent },
  ghost: { background: 'transparent', pressed: colors.surfaceMuted, content: colors.primary },
  danger: { background: colors.dangerSoft, pressed: colors.border, content: colors.danger },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
}: ButtonProps) {
  const { background, pressed: pressedBackground, content } = palette[variant];
  const isSmall = size === 'sm';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isSmall && styles.small,
        { backgroundColor: pressed ? pressedBackground : background },
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={content} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon icon={icon} size={isSmall ? 16 : 19} color={content} strokeWidth={2.2} />}
          <Text
            variant={isSmall ? 'caption' : 'bodyStrong'}
            style={[styles.label, { color: content }]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});
