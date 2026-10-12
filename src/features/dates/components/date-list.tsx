import { router } from 'expo-router';
import { CalendarHeart } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatDay, formatDayWithoutYear, parseDay, startOfToday } from '@/shared/utils/date';

import { useImportantDates } from '../hooks';
import { formatYears, sortByUpcoming } from '@/shared/utils/occurrence';
import type { UpcomingDate } from '../types';
import { DateBadge } from './date-badge';
import { DaysLeftPill } from './days-left-pill';

type DateListProps = {
  coupleId: string;
};

export function DateList({ coupleId }: DateListProps) {
  const dates = useImportantDates(coupleId);

  if (dates.isPending) {
    return <LoadingState />;
  }

  if (dates.isError) {
    return <ErrorState title="No se pudieron cargar las fechas" onRetry={() => dates.refetch()} />;
  }

  return (
    <FlatList
      data={sortByUpcoming(dates.data, startOfToday())}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <DateRow item={item} />}
      refreshControl={
        <RefreshControl
          refreshing={dates.isRefetching}
          onRefresh={() => dates.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon={CalendarHeart}
          title="Aún no hay fechas"
          description="Agrega aniversarios y cumpleaños con el botón + para no olvidarlos."
        />
      }
    />
  );
}

function DateRow({ item }: { item: UpcomingDate }) {
  const { occurrence } = item;
  const years = formatYears(occurrence?.years ?? null);
  const date = occurrence?.date ?? parseDay(item.date);
  const when = item.repeats_yearly ? formatDayWithoutYear(date) : formatDay(item.date);

  return (
    <Card
      onPress={() => router.push({ pathname: '/dates/[id]', params: { id: item.id } })}
      style={styles.row}
    >
      <DateBadge date={date} highlighted={occurrence?.daysLeft === 0} muted={!occurrence} />
      <View style={styles.info}>
        <Text variant="bodyStrong" numberOfLines={1} tone={occurrence ? 'default' : 'muted'}>
          {item.title}
        </Text>
        <Text variant="caption" tone="muted">
          {years ? `${when} · ${years}` : when}
        </Text>
      </View>
      {occurrence ? (
        <DaysLeftPill daysLeft={occurrence.daysLeft} />
      ) : (
        <Text variant="caption" tone="muted">
          Ya pasó
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md - spacing.xs,
    paddingBottom: spacing.xl * 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
  },
});
