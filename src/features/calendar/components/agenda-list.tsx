import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import type { AgendaItem } from '@/shared/utils/agenda';
import { formatTime, formatWeekday, parseDay } from '@/shared/utils/date';
import { formatYears } from '@/shared/utils/occurrence';

type AgendaListProps = {
  items: AgendaItem[];
  showDay?: boolean;
};

export function AgendaList({ items, showDay = false }: AgendaListProps) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <AgendaRow key={item.key} item={item} showDay={showDay} />
      ))}
    </View>
  );
}

function describe(item: AgendaItem) {
  if (item.kind === 'special') return formatYears(item.years) ?? 'Fecha importante';
  if (item.span) return `Día ${item.span.index + 1} de ${item.span.total}`;
  if (item.startTime && item.endTime) {
    return `${formatTime(item.startTime)} a ${formatTime(item.endTime)}`;
  }
  return null;
}

function AgendaRow({ item, showDay }: { item: AgendaItem; showDay: boolean }) {
  const detail = describe(item);
  const subtitle = [showDay ? formatWeekday(parseDay(item.day)) : null, detail]
    .filter(Boolean)
    .join(' · ');

  function open() {
    if (item.kind === 'special') {
      router.push({ pathname: '/dates/[id]', params: { id: item.id } });
    } else {
      router.push({ pathname: '/calendar/[id]', params: { id: item.id } });
    }
  }

  return (
    <Card onPress={open} style={styles.row} accessibilityLabel={item.title}>
      {item.kind === 'special' ? (
        <View style={[styles.marker, styles.specialMarker]}>
          <Icon icon={Heart} size={18} color={colors.accent} fill={colors.accent} />
        </View>
      ) : (
        <View style={[styles.marker, styles.planMarker]}>
          <Text style={styles.time} numberOfLines={2}>
            {item.startTime ? formatTime(item.startTime) : 'Todo\nel día'}
          </Text>
        </View>
      )}
      <View style={styles.texts}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.title}
        </Text>
        {subtitle !== '' && (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm + spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    paddingVertical: spacing.md - spacing.xxs,
  },
  marker: {
    width: 52,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planMarker: {
    backgroundColor: colors.primarySoft,
  },
  specialMarker: {
    backgroundColor: colors.accentSoft,
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 15,
    color: colors.primary,
    textAlign: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
