import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from 'react-native';

import { colors, typography } from '@/shared/theme';

export type TextTone = 'default' | 'muted' | 'danger' | 'primary' | 'accent' | 'inverse';

type TextProps = NativeTextProps & {
  variant?: keyof typeof typography;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
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
      style={[typography[variant], styles[tone], { textAlign: align }, style]}
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
  accent: {
    color: colors.accent,
  },
  inverse: {
    color: colors.primaryText,
  },
});
