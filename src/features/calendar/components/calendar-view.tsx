import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Fab } from '@/shared/ui/fab';
import { SectionHeader } from '@/shared/ui/section-header';
import { Text } from '@/shared/ui/text';
import {
  buildAgenda,
  groupByDay,
  type AgendaEvent,
  type AgendaSpecial,
} from '@/shared/utils/agenda';
import {
  addDays,
  formatWeekday,
  parseDay,
  startOfMonth,
  startOfToday,
  toDay,
} from '@/shared/utils/date';

import { AgendaList } from './agenda-list';
import { gridRange, MonthGrid } from './month-grid';

const UPCOMING_DAYS = 90;
const UPCOMING_LIMIT = 5;

type CalendarViewProps = {
  events: AgendaEvent[];
  specials: AgendaSpecial[];
  refreshing: boolean;
  onRefresh: () => void;
};

export function CalendarView({ events, specials, refreshing, onRefresh }: CalendarViewProps) {
  const today = startOfToday();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(() => toDay(today));

  const itemsByDay = useMemo(() => {
    const { start, end } = gridRange(month);
    return groupByDay(buildAgenda(events, specials, start, end));
  }, [events, specials, month]);

  const upcoming = useMemo(() => {
    const from = startOfToday();
    return buildAgenda(events, specials, from, addDays(from, UPCOMING_DAYS)).slice(
      0,
      UPCOMING_LIMIT,
    );
  }, [events, specials]);

  const dayItems = itemsByDay.get(selectedDay) ?? [];

  function selectDay(day: string) {
    setSelectedDay(day);
    const date = parseDay(day);
    if (date.getMonth() !== month.getMonth()) setMonth(startOfMonth(date));
  }

  function changeMonth(next: Date) {
    setMonth(next);
    const isCurrent =
      next.getMonth() === today.getMonth() && next.getFullYear() === today.getFullYear();
    setSelectedDay(toDay(isCurrent ? today : next));
  }

  function addPlan() {
    router.push({ pathname: '/calendar/new', params: { day: selectedDay } });
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <MonthGrid
          month={month}
          selectedDay={selectedDay}
          itemsByDay={itemsByDay}
          onSelectDay={selectDay}
          onChangeMonth={changeMonth}
        />

        <View style={styles.section}>
          <SectionHeader title={formatWeekday(parseDay(selectedDay))} />
          {dayItems.length > 0 ? (
            <AgendaList items={dayItems} />
          ) : (
            <Card tone="muted" style={styles.empty}>
              <Text tone="muted" align="center">
                Nada planeado este día.
              </Text>
              <Button title="Agregar un plan" variant="ghost" size="sm" onPress={addPlan} />
            </Card>
          )}
        </View>

        {upcoming.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Próximamente" />
            <AgendaList items={upcoming} showDay />
          </View>
        )}
      </ScrollView>
      <Fab accessibilityLabel="Nuevo plan" onPress={addPlan} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl * 3,
  },
  section: {
    gap: spacing.md - spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});
