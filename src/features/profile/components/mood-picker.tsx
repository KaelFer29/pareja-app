import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Chip } from '@/shared/ui/chip';
import { Notice } from '@/shared/ui/notice';

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
            <Chip
              key={option.value}
              emoji={option.emoji}
              label={option.label}
              selected={isSelected}
              onPress={() => updateMood.mutate({ userId, mood: isSelected ? null : option.value })}
            />
          );
        })}
      </View>
      {updateMood.isError && (
        <Notice message="No se pudo guardar tu estado. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md - spacing.xs,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
