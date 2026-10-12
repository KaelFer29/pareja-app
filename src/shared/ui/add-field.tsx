import { Plus } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { TextField } from './text-field';

type AddFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  accessibilityLabel: string;
  maxLength: number;
  loading?: boolean;
};

export function AddField({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  accessibilityLabel,
  maxLength,
  loading = false,
}: AddFieldProps) {
  const isDisabled = value.trim() === '' || loading;

  return (
    <View style={styles.container}>
      <TextField
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        submitBehavior="submit"
        returnKeyType="done"
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
          isDisabled && !loading && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Icon icon={Plus} size={22} color={colors.primaryText} strokeWidth={2.4} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
