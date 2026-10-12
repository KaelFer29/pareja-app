import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, shadows, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { addDays, parseDay, startOfToday, toDay } from '@/shared/utils/date';

import { useDismissOuting, usePendingOuting, useScheduleOuting } from '../hooks';
import type { PetOuting } from '../types';

const QUICK_DAYS = 3;
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type OutingProposalProps = {
  coupleId: string;
  petName: string;
};

export function OutingProposal({ coupleId, petName }: OutingProposalProps) {
  const outing = usePendingOuting(coupleId);
  if (!outing.data) return null;
  return (
    <ProposalBubble
      key={outing.data.id}
      coupleId={coupleId}
      outing={outing.data}
      petName={petName}
    />
  );
}

function firstAllowedDay(reachedOn: string) {
  const dayAfter = addDays(parseDay(reachedOn), 1);
  const today = startOfToday();
  return dayAfter > today ? dayAfter : today;
}

function dayLabel(date: Date) {
  const today = startOfToday();
  if (toDay(date) === toDay(today)) return 'Hoy';
  if (toDay(date) === toDay(addDays(today, 1))) return 'Mañana';
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}`;
}

type ProposalBubbleProps = OutingProposalProps & {
  outing: PetOuting;
};

function ProposalBubble({ coupleId, outing, petName }: ProposalBubbleProps) {
  const [day, setDay] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const schedule = useScheduleOuting(coupleId);
  const dismiss = useDismissOuting(coupleId);
  const idea = outing.idea;

  const firstDay = firstAllowedDay(outing.reached_on);
  const quickDays = Array.from({ length: QUICK_DAYS }, (_, index) => addDays(firstDay, index));
  const quickKeys = quickDays.map(toDay);
  const customDay = day && !quickKeys.includes(day) ? day : null;

  function confirm() {
    if (!day) return;
    schedule.mutate(
      { outingId: outing.id, day },
      {
        onSuccess: (event) => router.push({ pathname: '/calendar/[id]', params: { id: event.id } }),
      },
    );
  }

  const failed = schedule.isError || dismiss.isError;

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <View style={styles.idea}>
          <View style={styles.streakRow}>
            <Icon icon={Flame} size={13} color={colors.streak} fill={colors.streak} />
            <Text style={styles.streakText}>
              ¡{outing.streak} días de racha! {petName} propone
            </Text>
          </View>
          <Text variant="heading" align="center">
            {idea ? `${idea.title} ${idea.emoji}` : 'Una salida juntos'}
          </Text>
        </View>

        <View style={styles.days}>
          {quickDays.map((date, index) => (
            <Chip
              key={quickKeys[index]}
              label={dayLabel(date)}
              selected={day === quickKeys[index]}
              onPress={() => setDay(quickKeys[index])}
            />
          ))}
          <Chip
            label={customDay ? dayLabel(parseDay(customDay)) : 'Otro día'}
            selected={!!customDay}
            onPress={() => setPickerOpen(true)}
          />
        </View>

        {pickerOpen && (
          <DateTimePicker
            value={customDay ? parseDay(customDay) : addDays(firstDay, QUICK_DAYS)}
            mode="date"
            display="default"
            minimumDate={firstDay}
            accentColor={colors.primary}
            onValueChange={(_event, date) => {
              setPickerOpen(false);
              setDay(toDay(date));
            }}
            onDismiss={() => setPickerOpen(false)}
          />
        )}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => dismiss.mutate(outing.id)}
            disabled={dismiss.isPending}
            hitSlop={8}
            style={styles.dismiss}
          >
            <Text variant="caption" tone="muted">
              Esta vez no
            </Text>
          </Pressable>
          <View style={styles.flex}>
            <Button
              title="Agendar"
              size="sm"
              disabled={!day}
              loading={schedule.isPending}
              onPress={confirm}
            />
          </View>
        </View>

        {failed ? (
          <Text variant="caption" tone="danger" align="center">
            No se pudo guardar la salida. Revisa tu conexión e inténtalo de nuevo.
          </Text>
        ) : null}
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  bubble: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    gap: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tail: {
    width: 18,
    height: 18,
    marginTop: -10,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    borderBottomRightRadius: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.streak,
  },
  idea: {
    alignItems: 'center',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dismiss: {
    paddingHorizontal: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
