import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { daysBetween, formatDay, parseDay, startOfToday } from '@/shared/utils/date';

import { StartedOnField } from './started-on-field';

type DaysTogetherCardProps = {
  coupleId: string;
  startedOn: string | null;
  header?: ReactNode;
};

export function DaysTogetherCard({ coupleId, startedOn, header }: DaysTogetherCardProps) {
  if (!startedOn) {
    return (
      <Card tone="primary" style={styles.card}>
        {header}
        <View style={styles.texts}>
          <Text variant="heading" align="center">
            ¿Desde cuándo están juntos?
          </Text>
          <Text tone="muted" align="center">
            Elige la fecha para empezar a contar los días.
          </Text>
        </View>
        <View style={styles.field}>
          <StartedOnField coupleId={coupleId} startedOn={null} />
        </View>
      </Card>
    );
  }

  const days = daysBetween(parseDay(startedOn), startOfToday());

  return (
    <Card tone="primary" style={styles.card}>
      {header}
      <View style={styles.counter}>
        <Text variant="display" tone="accent" align="center">
          {days.toLocaleString('es')}
        </Text>
        <Text variant="heading" tone="primary" align="center">
          {days === 1 ? 'día juntos' : 'días juntos'}
        </Text>
        <Text variant="caption" tone="muted" align="center" style={styles.since}>
          Desde el {formatDay(startedOn)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  texts: {
    gap: spacing.xs,
  },
  field: {
    alignSelf: 'stretch',
  },
  counter: {
    alignItems: 'center',
  },
  since: {
    marginTop: spacing.xs,
  },
});
