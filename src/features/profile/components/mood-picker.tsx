import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { useUpdateMood } from '../hooks';
import { MOODS } from '../moods';

type MoodPickerProps = {
  userId: string;
  mood: string | null;
};

export function MoodPicker({ userId, mood }: MoodPickerProps) {
  const updateMood = useUpdateMood();

  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {MOODS.map((option) => {
          const isSelected = option.value === mood;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => updateMood.mutate({ userId, mood: isSelected ? null : option.value })}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text>
                {option.emoji} {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {updateMood.isError && (
        <Text variant="caption" tone="danger">
          No se pudo guardar tu estado. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.8,
  },
});
