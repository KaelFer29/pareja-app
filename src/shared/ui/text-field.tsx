import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';

import { Text } from './text';

type TextFieldProps = TextInputProps & {
  label?: string;
  ref?: Ref<TextInput>;
};

export function TextField({ label, style, onFocus, onBlur, ref, ...props }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const input = (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      style={[styles.input, isFocused && styles.focused, style]}
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <View style={styles.container}>
      <Text variant="caption" tone="muted" style={styles.label}>
        {label}
      </Text>
      {input}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + spacing.xxs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    minHeight: 52,
  },
  focused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
});
