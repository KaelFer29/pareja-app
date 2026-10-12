import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';
import type { AgendaItem } from '@/shared/utils/agenda';
import { addDays, addMonths, formatMonthYear, startOfToday, toDay } from '@/shared/utils/date';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type MonthGridProps = {
  month: Date;
  selectedDay: string;
  itemsByDay: Map<string, AgendaItem[]>;
  onSelectDay: (day: string) => void;
  onChangeMonth: (month: Date) => void;
};

export function gridRange(month: Date) {
  const offset = (month.getDay() + 6) % 7;
  const start = addDays(month, -offset);
  return { start, end: addDays(start, 41) };
}

export function MonthGrid({
  month,
  selectedDay,
  itemsByDay,
  onSelectDay,
  onChangeMonth,
}: MonthGridProps) {
  const { start } = gridRange(month);
  const today = toDay(startOfToday());
  const weeks = Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => addDays(start, week * 7 + weekday)),
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconButton
          icon={ChevronLeft}
          size={36}
          accessibilityLabel="Mes anterior"
          onPress={() => onChangeMonth(addMonths(month, -1))}
        />
        <Text variant="heading" align="center" style={styles.month}>
          {formatMonthYear(month)}
        </Text>
        <IconButton
          icon={ChevronRight}
          size={36}
          accessibilityLabel="Mes siguiente"
          onPress={() => onChangeMonth(addMonths(month, 1))}
        />
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((weekday, index) => (
          <Text key={index} variant="caption" tone="muted" align="center" style={styles.cell}>
            {weekday}
          </Text>
        ))}
      </View>

      {weeks.map((days) => (
        <View key={toDay(days[0])} style={styles.row}>
          {days.map((date) => {
            const day = toDay(date);
            const items = itemsByDay.get(day) ?? [];
            const isSelected = day === selectedDay;
            const isToday = day === today;
            const isOutside = date.getMonth() !== month.getMonth();
            const hasSpecial = items.some((item) => item.kind === 'special');
            const plans = Math.min(items.filter((item) => item.kind === 'plan').length, 3);

            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={date.toLocaleDateString('es', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                onPress={() => onSelectDay(day)}
                style={styles.cell}
              >
                <View
                  style={[
                    styles.day,
                    isToday && styles.today,
                    isSelected && styles.selected,
                    hasSpecial && !isSelected && styles.special,
                  ]}
                >
                  <Text
                    style={[
                      styles.number,
                      isOutside && styles.outside,
                      isToday && styles.todayNumber,
                      isSelected && styles.selectedNumber,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {Array.from({ length: plans }, (_, index) => (
                    <View key={index} style={[styles.dot, isOutside && styles.outsideDot]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.dot} />
          <Text variant="caption" tone="muted">
            Planes
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendRing} />
          <Text variant="caption" tone="muted">
            Fechas importantes
          </Text>
        </View>
      </View>
    </Card>
  );
}

const DAY_SIZE = 36;

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  month: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  today: {
    backgroundColor: colors.primarySoft,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  special: {
    borderColor: colors.accent,
  },
  number: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
  },
  outside: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  todayNumber: {
    fontFamily: fonts.extrabold,
    color: colors.primary,
  },
  selectedNumber: {
    fontFamily: fonts.extrabold,
    color: colors.primaryText,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 8,
    paddingTop: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  outsideDot: {
    opacity: 0.4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + spacing.xxs,
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
});
