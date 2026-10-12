import { StyleSheet } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { daysBetween, formatDay, parseDay, startOfToday } from '@/shared/utils/date';

import { StartedOnField } from './started-on-field';

type DaysTogetherCardProps = {
  coupleId: string;
  startedOn: string | null;
};

export function DaysTogetherCard({ coupleId, startedOn }: DaysTogetherCardProps) {
  if (!startedOn) {
    return (
      <Card>
        <Text variant="subtitle">¿Desde cuándo están juntos?</Text>
        <Text tone="muted">Elige la fecha para empezar a contar los días.</Text>
        <StartedOnField coupleId={coupleId} startedOn={null} />
      </Card>
    );
  }

  const days = daysBetween(parseDay(startedOn), startOfToday());

  return (
    <Card style={styles.card}>
      <Text variant="display" tone="primary">
        {days.toLocaleString('es')}
      </Text>
      <Text variant="subtitle">{days === 1 ? 'día juntos' : 'días juntos'}</Text>
      <Text variant="caption" tone="muted">
        Desde el {formatDay(startedOn)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
});
