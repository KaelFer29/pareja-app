import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from 'react-native';

import { colors, typography } from '@/shared/theme';

type TextProps = NativeTextProps & {
  variant?: keyof typeof typography;
  tone?: 'default' | 'muted' | 'danger' | 'primary';
  align?: 'left' | 'center';
};

export function Text({
  variant = 'body',
  tone = 'default',
  align = 'left',
  style,
  ...props
}: TextProps) {
  return (
    <NativeText
      style={[typography[variant], styles[tone], align === 'center' && styles.center, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  danger: {
    color: colors.danger,
  },
  primary: {
    color: colors.primary,
  },
  center: {
    textAlign: 'center',
  },
});
