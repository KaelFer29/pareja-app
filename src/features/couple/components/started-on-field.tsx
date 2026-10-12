import { View, StyleSheet } from 'react-native';

import { spacing } from '@/shared/theme';
import { DateField } from '@/shared/ui/date-field';
import { Text } from '@/shared/ui/text';
import { startOfToday } from '@/shared/utils/date';

import { useUpdateStartedOn } from '../hooks';

type StartedOnFieldProps = {
  coupleId: string;
  startedOn: string | null;
};

export function StartedOnField({ coupleId, startedOn }: StartedOnFieldProps) {
  const updateStartedOn = useUpdateStartedOn();

  return (
    <View style={styles.container}>
      <DateField
        value={startedOn}
        placeholder="Elige la fecha"
        maximumDate={startOfToday()}
        onChange={(day) => updateStartedOn.mutate({ coupleId, startedOn: day })}
      />
      {updateStartedOn.isError && (
        <Text variant="caption" tone="danger">
          No se pudo guardar la fecha. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
