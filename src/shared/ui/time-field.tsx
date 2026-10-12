import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { dateToTime, formatTime, timeToDate } from '@/shared/utils/date';

import { Button } from './button';
import { Icon } from './icon';
import { Text } from './text';

type TimeFieldProps = {
  value: string | null;
  onChange: (time: string | null) => void;
  placeholder: string;
  label?: string;
};

export function TimeField({ value, onChange, placeholder, label }: TimeFieldProps) {
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
        <Icon icon={Clock} size={20} color={colors.accent} />
        <Text tone={value ? 'default' : 'muted'} style={styles.value}>
          {value ? formatTime(value) : placeholder}
        </Text>
        {value && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar hora"
            hitSlop={10}
            onPress={() => onChange(null)}
          >
            <Icon icon={X} size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </Pressable>
      {isOpen && (
        <>
          <DateTimePicker
            value={value ? timeToDate(value) : new Date()}
            mode="time"
            is24Hour
            display={isIos ? 'spinner' : 'default'}
            accentColor={colors.primary}
            onValueChange={(_event, date) => {
              if (!isIos) setIsOpen(false);
              onChange(dateToTime(date));
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
    flex: 1,
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
