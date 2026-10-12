import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { formatDayWithoutYear, startOfToday } from '@/shared/utils/date';

import { useImportantDates } from '../hooks';
import { formatDaysLeft, formatYears, sortByUpcoming } from '../occurrence';

type NextDateCardProps = {
  coupleId: string;
};

export function NextDateCard({ coupleId }: NextDateCardProps) {
  const dates = useImportantDates(coupleId);
  const [next] = sortByUpcoming(dates.data ?? [], startOfToday());
  const occurrence = next?.occurrence;
  const years = formatYears(occurrence?.years ?? null);

  return (
    <Pressable
      onPress={() => router.push('/dates')}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <Text variant="caption" tone="muted">
          Próxima fecha
        </Text>
        {next && occurrence ? (
          <>
            <Text variant="subtitle">{next.title}</Text>
            <Text tone="primary">
              {formatDaysLeft(occurrence.daysLeft)} - {formatDayWithoutYear(occurrence.date)}
              {years ? ` - ${years}` : ''}
            </Text>
          </>
        ) : (
          <Text tone="muted">
            {dates.isPending
              ? 'Cargando fechas.'
              : 'Agrega aniversarios y cumpleaños para no olvidarlos.'}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
});
