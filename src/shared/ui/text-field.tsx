import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';

export function TextField({ style, ...props }: TextInputProps) {
  return (
    <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
