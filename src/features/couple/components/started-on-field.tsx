import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { DateField } from '@/shared/ui/date-field';
import { Notice } from '@/shared/ui/notice';
import { startOfToday } from '@/shared/utils/date';

import { useUpdateStartedOn } from '../hooks';

type StartedOnFieldProps = {
  coupleId: string;
  startedOn: string | null;
  label?: string;
};

export function StartedOnField({ coupleId, startedOn, label }: StartedOnFieldProps) {
  const updateStartedOn = useUpdateStartedOn();

  return (
    <View style={styles.container}>
      <DateField
        label={label}
        value={startedOn}
        placeholder="Elige la fecha"
        maximumDate={startOfToday()}
        onChange={(day) => updateStartedOn.mutate({ coupleId, startedOn: day })}
      />
      {updateStartedOn.isError && (
        <Notice message="No se pudo guardar la fecha. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
