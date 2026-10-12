import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/shared/theme';

type CardTone = 'default' | 'primary' | 'accent' | 'muted';

type CardProps = PropsWithChildren<{
  tone?: CardTone;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}>;

const backgrounds: Record<CardTone, string> = {
  default: colors.surface,
  primary: colors.primarySoft,
  accent: colors.accentSoft,
  muted: colors.surfaceMuted,
};

export function Card({
  children,
  tone = 'default',
  onPress,
  accessibilityLabel,
  style,
}: CardProps) {
  const baseStyle = [
    styles.card,
    { backgroundColor: backgrounds[tone] },
    tone === 'default' && shadows.card,
  ];

  if (!onPress) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [baseStyle, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md + spacing.xs,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
