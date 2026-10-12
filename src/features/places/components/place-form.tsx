import { router } from 'expo-router';
import { Check, LocateFixed, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { DateField } from '@/shared/ui/date-field';
import { Notice } from '@/shared/ui/notice';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { startOfToday } from '@/shared/utils/date';

import { useCreatePlace, useDeletePlace, useUpdatePlace } from '../hooks';
import { getCurrentLocation, suggestPlaceName } from '../location';
import type { Coordinates, Place } from '../types';
import { PlaceMap } from './place-map';

type PlaceFormProps = {
  coupleId: string;
  place?: Place;
  initialCoordinates?: Coordinates;
};

export function PlaceForm({ coupleId, place, initialCoordinates }: PlaceFormProps) {
  const [name, setName] = useState(place?.name ?? '');
  const [note, setNote] = useState(place?.note ?? '');
  const [visitedOn, setVisitedOn] = useState<string | null>(place?.visited_on ?? null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(
    place ? { latitude: place.latitude, longitude: place.longitude } : (initialCoordinates ?? null),
  );
  const [locating, setLocating] = useState(false);
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const deletePlace = useDeletePlace();

  const isSaving = createPlace.isPending || updatePlace.isPending;
  const saveFailed = createPlace.isError || updatePlace.isError;
  const canSave = name.trim() !== '' && coordinates !== null;

  useEffect(() => {
    if (place || !initialCoordinates) return;
    suggestPlaceName(initialCoordinates).then((suggestion) => {
      if (suggestion) setName((current) => current || suggestion);
    });
  }, [place, initialCoordinates]);

  async function locateMe() {
    setLocating(true);
    try {
      const result = await getCurrentLocation();
      if (result.status === 'denied') {
        Alert.alert(
          'Sin acceso a tu ubicación',
          'Permite el acceso a la ubicación en los ajustes del teléfono o marca el lugar en el mapa.',
        );
        return;
      }
      setCoordinates(result.coordinates);
      const suggestion = await suggestPlaceName(result.coordinates);
      if (suggestion) setName((current) => current || suggestion);
    } catch {
      Alert.alert(
        'No se pudo obtener tu ubicación',
        'Revisa que el GPS esté activo e inténtalo de nuevo.',
      );
    } finally {
      setLocating(false);
    }
  }

  function save() {
    if (!coordinates) return;
    const draft = { name, note, visitedOn, ...coordinates };
    const onSuccess = () => router.back();
    if (place) {
      updatePlace.mutate({ id: place.id, ...draft }, { onSuccess });
    } else {
      createPlace.mutate({ coupleId, ...draft }, { onSuccess });
    }
  }

  function confirmDelete() {
    if (!place) return;
    Alert.alert('Eliminar lugar', 'El lugar se eliminará para los dos. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deletePlace.mutate(place.id, {
            onSuccess: () => router.back(),
            onError: () =>
              Alert.alert(
                'No se pudo eliminar el lugar',
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
      <Card style={styles.card}>
        {coordinates ? (
          <PlaceMap
            key={`${coordinates.latitude},${coordinates.longitude}`}
            points={[{ id: 'draft', name: name || 'Nuevo lugar', ...coordinates }]}
            interactive={false}
            style={styles.preview}
          />
        ) : (
          <View style={[styles.preview, styles.noLocation]}>
            {locating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text tone="muted" align="center">
                Usa tu ubicación actual o mantén presionado el mapa de lugares para marcar uno.
              </Text>
            )}
          </View>
        )}
        <Button
          title={coordinates ? 'Usar mi ubicación actual' : 'Usar mi ubicación'}
          variant="secondary"
          size="sm"
          icon={LocateFixed}
          onPress={locateMe}
          loading={locating}
        />
      </Card>

      <Card style={styles.card}>
        <TextField
          label="Nombre"
          placeholder="Por ejemplo, El café de la primera cita"
          maxLength={80}
          value={name}
          onChangeText={setName}
        />
        <DateField
          label="Cuándo fueron"
          value={visitedOn}
          onChange={setVisitedOn}
          placeholder="Elige la fecha (opcional)"
          maximumDate={startOfToday()}
        />
        <TextField
          label="Recuerdo"
          placeholder="Qué hicieron, qué comieron, por qué es especial"
          maxLength={1000}
          multiline
          value={note}
          onChangeText={setNote}
          style={styles.note}
        />
      </Card>

      {saveFailed && (
        <Notice message="No se pudo guardar el lugar. Revisa tu conexión e inténtalo de nuevo." />
      )}
      <Button title="Guardar" icon={Check} onPress={save} loading={isSaving} disabled={!canSave} />
      {place && (
        <Button
          title="Eliminar lugar"
          variant="danger"
          icon={Trash2}
          onPress={confirmDelete}
          loading={deletePlace.isPending}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  preview: {
    height: 180,
  },
  noLocation: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  note: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
