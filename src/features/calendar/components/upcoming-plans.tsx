import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { buildAgenda, type AgendaEvent, type AgendaSpecial } from '@/shared/utils/agenda';
import { addDays, startOfToday } from '@/shared/utils/date';

import { AgendaList } from './agenda-list';

const UPCOMING_DAYS = 60;

type UpcomingPlansProps = {
  events: AgendaEvent[];
  specials: AgendaSpecial[];
  limit?: number;
};

export function UpcomingPlans({ events, specials, limit = 3 }: UpcomingPlansProps) {
  const items = useMemo(() => {
    const from = startOfToday();
    const seen = new Set<string>();
    return buildAgenda(events, specials, from, addDays(from, UPCOMING_DAYS))
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, limit);
  }, [events, specials, limit]);

  if (items.length === 0) {
    return (
      <Card tone="muted" style={styles.empty}>
        <Text tone="muted" align="center">
          No hay planes en los próximos días.
        </Text>
        <Button
          title="Agregar un plan"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/calendar/new')}
        />
      </Card>
    );
  }

  return <AgendaList items={items} showDay />;
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});
