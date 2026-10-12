import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { formatDay, parseDay, toDay } from '@/shared/utils/date';

import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

type DateFieldProps = {
  value: string | null;
  onChange: (day: string) => void;
  placeholder: string;
  label?: string;
  maximumDate?: Date;
};

export function DateField({ value, onChange, placeholder, label, maximumDate }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isIos = Platform.OS === 'ios';

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="caption" tone="muted" style={styles.label}>
          {label}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.input, (pressed || isOpen) && styles.active]}
      >
        <Icon icon={CalendarDays} size={20} color={colors.accent} />
        <Text tone={value ? 'default' : 'muted'} style={styles.value}>
          {value ? formatDay(value) : placeholder}
        </Text>
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
    gap: spacing.xs + spacing.xxs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xxs,
    minHeight: 52,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  active: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  value: {
    flex: 1,
  },
});
