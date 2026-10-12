import { router } from 'expo-router';
import { CalendarHeart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { formatDayWithoutYear, startOfToday } from '@/shared/utils/date';

import { useImportantDates } from '../hooks';
import { formatYears, sortByUpcoming } from '@/shared/utils/occurrence';
import { DateBadge } from './date-badge';
import { DaysLeftPill } from './days-left-pill';

type NextDateCardProps = {
  coupleId: string;
};

export function NextDateCard({ coupleId }: NextDateCardProps) {
  const dates = useImportantDates(coupleId);
  const [next] = sortByUpcoming(dates.data ?? [], startOfToday());
  const occurrence = next?.occurrence;
  const years = formatYears(occurrence?.years ?? null);

  if (!next || !occurrence) {
    return (
      <Card onPress={() => router.push('/dates')} style={styles.row}>
        <View style={styles.emptyIcon}>
          <Icon icon={CalendarHeart} size={24} color={colors.accent} />
        </View>
        <Text tone="muted" style={styles.texts}>
          {dates.isPending
            ? 'Cargando fechas.'
            : 'Agrega aniversarios y cumpleaños para no olvidarlos.'}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      onPress={() => router.push({ pathname: '/dates/[id]', params: { id: next.id } })}
      style={styles.row}
    >
      <DateBadge date={occurrence.date} highlighted={occurrence.daysLeft === 0} />
      <View style={styles.texts}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {next.title}
        </Text>
        <Text variant="caption" tone="muted">
          {formatDayWithoutYear(occurrence.date)}
          {years ? ` · ${years}` : ''}
        </Text>
      </View>
      <DaysLeftPill daysLeft={occurrence.daysLeft} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  emptyIcon: {
    width: 52,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
