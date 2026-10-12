import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { formatDay, parseDay, toDay } from '@/shared/utils/date';

import { Button } from './button';
import { Text } from './text';

type DateFieldProps = {
  value: string | null;
  onChange: (day: string) => void;
  placeholder: string;
  maximumDate?: Date;
};

export function DateField({ value, onChange, placeholder, maximumDate }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isIos = Platform.OS === 'ios';

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.input, pressed && styles.pressed]}
      >
        <Text tone={value ? 'default' : 'muted'}>{value ? formatDay(value) : placeholder}</Text>
      </Pressable>
      {isOpen && (
        <>
          <DateTimePicker
            value={value ? parseDay(value) : (maximumDate ?? new Date())}
            mode="date"
            display={isIos ? 'inline' : 'default'}
            maximumDate={maximumDate}
            accentColor={colors.primary}
            onValueChange={(_event, date) => {
              if (!isIos) setIsOpen(false);
              onChange(toDay(date));
            }}
            onDismiss={() => setIsOpen(false)}
          />
          {isIos && <Button title="Listo" variant="secondary" onPress={() => setIsOpen(false)} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
});
