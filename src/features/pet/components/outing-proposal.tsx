import { router } from 'expo-router';
import { CalendarPlus, Flame } from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { PET_ART } from '@/shared/lib/pet-art';
import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';
import { addDays, parseDay, startOfToday } from '@/shared/utils/date';

import { useDismissOuting, usePendingOuting, useScheduleOuting } from '../hooks';
import type { PetOuting, PetStage } from '../types';

type OutingProposalProps = {
  coupleId: string;
  petName: string;
  stage: PetStage;
};

export function OutingProposal({ coupleId, petName, stage }: OutingProposalProps) {
  const outing = usePendingOuting(coupleId);
  if (!outing.data) return null;
  return (
    <ProposalCard
      key={outing.data.id}
      coupleId={coupleId}
      outing={outing.data}
      petName={petName}
      stage={stage}
    />
  );
}

function firstAllowedDay(reachedOn: string) {
  const dayAfter = addDays(parseDay(reachedOn), 1);
  const today = startOfToday();
  return dayAfter > today ? dayAfter : today;
}

type ProposalCardProps = OutingProposalProps & {
  outing: PetOuting;
};

function ProposalCard({ coupleId, outing, petName, stage }: ProposalCardProps) {
  const [picking, setPicking] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const schedule = useScheduleOuting(coupleId);
  const dismiss = useDismissOuting(coupleId);
  const idea = outing.idea;
  const title = idea ? `${idea.emoji} ${idea.title}` : 'Una salida juntos';

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
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={PET_ART[stage].happy} style={styles.pet} resizeMode="contain" />
        <View style={styles.texts}>
          <View style={styles.streakRow}>
            <Icon icon={Flame} size={14} color={colors.streak} fill={colors.streak} />
            <Text style={styles.streakText}>{outing.streak} días de racha</Text>
          </View>
          <Text variant="caption" tone="muted">
            {petName} les propone una salida
          </Text>
          <Text variant="heading">{title}</Text>
        </View>
      </View>

      {picking ? (
        <View style={styles.picker}>
          <DateField
            label="¿Qué día van?"
            value={day}
            onChange={setDay}
            placeholder="Elige el día"
            minimumDate={firstAllowedDay(outing.reached_on)}
          />
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                title="Cancelar"
                variant="ghost"
                size="sm"
                onPress={() => setPicking(false)}
              />
            </View>
            <View style={styles.action}>
              <Button
                title="Agendar"
                size="sm"
                icon={CalendarPlus}
                disabled={!day}
                loading={schedule.isPending}
                onPress={confirm}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              title="Esta vez no"
              variant="ghost"
              size="sm"
              loading={dismiss.isPending}
              onPress={() => dismiss.mutate(outing.id)}
            />
          </View>
          <View style={styles.action}>
            <Button
              title="Elegir día"
              size="sm"
              icon={CalendarPlus}
              onPress={() => setPicking(true)}
            />
          </View>
        </View>
      )}

      {failed && (
        <Notice message="No se pudo guardar la salida. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.streakSoft,
    borderWidth: 1.5,
    borderColor: colors.streak,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pet: {
    width: 64,
    height: 64,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors.streak,
  },
  picker: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
