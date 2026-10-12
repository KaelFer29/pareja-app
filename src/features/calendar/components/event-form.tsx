import { router } from 'expo-router';
import { CalendarPlus, CalendarRange, Check, Flame, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { DateField } from '@/shared/ui/date-field';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { TimeField } from '@/shared/ui/time-field';
import { formatTime, parseDay } from '@/shared/utils/date';

import { addToDeviceCalendar } from '../device-calendar';
import { useCreateEvent, useDeleteEvent, useUpdateEvent } from '../hooks';
import type { CalendarEvent } from '../types';

type EventFormProps = {
  coupleId: string;
  event?: CalendarEvent;
  initialDay?: string;
};

export function EventForm({ coupleId, event, initialDay }: EventFormProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [details, setDetails] = useState(event?.details ?? '');
  const [startsOn, setStartsOn] = useState<string | null>(event?.starts_on ?? initialDay ?? null);
  const [multiDay, setMultiDay] = useState(!!event?.ends_on);
  const [endsOn, setEndsOn] = useState<string | null>(event?.ends_on ?? null);
  const [startTime, setStartTime] = useState<string | null>(
    event?.start_time ? formatTime(event.start_time) : null,
  );
  const [endTime, setEndTime] = useState<string | null>(
    event?.end_time ? formatTime(event.end_time) : null,
  );
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const effectiveEnd = multiDay ? endsOn : null;
  const endBeforeStart = !!startsOn && !!effectiveEnd && effectiveEnd < startsOn;
  const sameDay = !effectiveEnd || effectiveEnd === startsOn;
  const endTimeBeforeStart = sameDay && !!startTime && !!endTime && endTime < startTime;
  const isSaving = createEvent.isPending || updateEvent.isPending;
  const saveFailed = createEvent.isError || updateEvent.isError;
  const canSave =
    title.trim() !== '' &&
    startsOn !== null &&
    (!multiDay || endsOn !== null) &&
    !endBeforeStart &&
    !endTimeBeforeStart;

  function save() {
    if (!startsOn) return;
    const draft = {
      title,
      details,
      startsOn,
      endsOn: effectiveEnd,
      startTime,
      endTime: startTime ? endTime : null,
    };
    const onSuccess = () => router.back();
    if (event) {
      updateEvent.mutate({ id: event.id, ...draft }, { onSuccess });
    } else {
      createEvent.mutate({ coupleId, ...draft }, { onSuccess });
    }
  }

  async function exportToDevice() {
    if (!event) return;
    try {
      const result = await addToDeviceCalendar(event);
      if (result === 'denied') {
        Alert.alert(
          'Sin acceso al calendario',
          'Permite el acceso al calendario en los ajustes del teléfono para copiar el plan.',
        );
      } else if (result === 'no-calendar') {
        Alert.alert(
          'No encontramos un calendario',
          'Agrega una cuenta de calendario en tu teléfono e inténtalo de nuevo.',
        );
      }
    } catch {
      Alert.alert('No se pudo abrir el calendario', 'Inténtalo de nuevo en un momento.');
    }
  }

  function confirmDelete() {
    if (!event) return;
    Alert.alert('Eliminar plan', 'El plan se eliminará para los dos. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteEvent.mutate(event.id, {
            onSuccess: () => router.back(),
            onError: () =>
              Alert.alert(
                'No se pudo eliminar el plan',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {event?.outing_streak ? (
        <View style={styles.streakBanner}>
          <Icon icon={Flame} size={20} color={colors.streak} fill={colors.streak} />
          <Text variant="bodyStrong" style={styles.streakText}>
            Salida por {event.outing_streak} días de racha
          </Text>
        </View>
      ) : null}
      <Card style={styles.card}>
        <TextField
          label="Plan"
          placeholder="Por ejemplo, Cena en nuestro lugar"
          maxLength={80}
          value={title}
          onChangeText={setTitle}
          autoFocus={!event}
        />
        <DateField
          label={multiDay ? 'Desde' : 'Fecha'}
          value={startsOn}
          onChange={setStartsOn}
          placeholder="Elige la fecha"
        />
        {multiDay && (
          <DateField
            label="Hasta"
            value={endsOn}
            onChange={setEndsOn}
            placeholder="Elige el último día"
            minimumDate={startsOn ? parseDay(startsOn) : undefined}
          />
        )}
        <View style={styles.switchRow}>
          <View style={styles.switchIcon}>
            <Icon icon={CalendarRange} size={18} color={colors.accent} />
          </View>
          <View style={styles.switchTexts}>
            <Text variant="bodyStrong">Dura varios días</Text>
            <Text variant="caption" tone="muted">
              Para viajes, vacaciones o escapadas.
            </Text>
          </View>
          <Switch
            value={multiDay}
            onValueChange={setMultiDay}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.times}>
          <TimeField
            label="Empieza"
            value={startTime}
            onChange={setStartTime}
            placeholder="Todo el día"
          />
          {startTime && (
            <TimeField
              label="Termina"
              value={endTime}
              onChange={setEndTime}
              placeholder="Opcional"
            />
          )}
        </View>
        <TextField
          label="Notas"
          placeholder="Dirección, reserva o lo que quieran recordar"
          maxLength={2000}
          multiline
          value={details}
          onChangeText={setDetails}
          style={styles.details}
        />
      </Card>

      {endBeforeStart && <Notice message="El último día no puede ser antes del primero." />}
      {endTimeBeforeStart && <Notice message="La hora de término no puede ser antes del inicio." />}
      {saveFailed && (
        <Notice message="No se pudo guardar el plan. Revisa tu conexión e inténtalo de nuevo." />
      )}

      <Button title="Guardar" icon={Check} onPress={save} loading={isSaving} disabled={!canSave} />
      {event && (
        <>
          <Button
            title="Agregar a mi calendario"
            variant="secondary"
            icon={CalendarPlus}
            onPress={exportToDevice}
          />
          <Button
            title="Eliminar plan"
            variant="danger"
            icon={Trash2}
            onPress={confirmDelete}
            loading={deleteEvent.isPending}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.streakSoft,
    borderWidth: 1.5,
    borderColor: colors.streak,
  },
  streakText: {
    color: colors.streak,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    paddingTop: spacing.xs,
  },
  switchIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTexts: {
    flex: 1,
  },
  times: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  details: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
