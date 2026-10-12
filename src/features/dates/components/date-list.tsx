import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { formatDay, formatDayWithoutYear, parseDay, startOfToday } from '@/shared/utils/date';

import { useImportantDates } from '../hooks';
import { formatDaysLeft, formatYears, sortByUpcoming } from '../occurrence';
import type { UpcomingDate } from '../types';

type DateListProps = {
  coupleId: string;
};

export function DateList({ coupleId }: DateListProps) {
  const dates = useImportantDates(coupleId);

  if (dates.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (dates.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudieron cargar las fechas. Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <Button title="Reintentar" onPress={() => dates.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={sortByUpcoming(dates.data, startOfToday())}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
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
        <Text tone="muted" align="center" style={styles.empty}>
          Aún no hay fechas. Agrega aniversarios y cumpleaños para no olvidarlos.
        </Text>
      }
    />
  );
}

function DateRow({ item }: { item: UpcomingDate }) {
  const { occurrence } = item;
  const years = formatYears(occurrence?.years ?? null);
  const when = item.repeats_yearly
    ? formatDayWithoutYear(occurrence?.date ?? parseDay(item.date))
    : formatDay(item.date);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/dates/[id]', params: { id: item.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.row}>
        <View style={styles.info}>
          <Text variant="subtitle">{item.title}</Text>
          <Text variant="caption" tone="muted">
            {years ? `${when} - ${years}` : when}
          </Text>
        </View>
        <Text tone={occurrence ? 'primary' : 'muted'}>
          {occurrence ? formatDaysLeft(occurrence.daysLeft) : 'Ya pasó'}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  empty: {
    marginTop: spacing.xl,
  },
});
