import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useCreateImportantDate, useDeleteImportantDate, useUpdateImportantDate } from '../hooks';
import type { ImportantDate } from '../types';

type DateFormProps = {
  coupleId: string;
  item?: ImportantDate;
};

export function DateForm({ coupleId, item }: DateFormProps) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [date, setDate] = useState<string | null>(item?.date ?? null);
  const [repeatsYearly, setRepeatsYearly] = useState(item?.repeats_yearly ?? true);
  const createDate = useCreateImportantDate();
  const updateDate = useUpdateImportantDate();
  const deleteDate = useDeleteImportantDate();

  const isSaving = createDate.isPending || updateDate.isPending;
  const saveFailed = createDate.isError || updateDate.isError;
  const canSave = title.trim() !== '' && date !== null;

  function save() {
    if (!date) return;
    const draft = { title, date, repeatsYearly };
    const onSuccess = () => router.back();
    if (item) {
      updateDate.mutate({ id: item.id, ...draft }, { onSuccess });
    } else {
      createDate.mutate({ coupleId, ...draft }, { onSuccess });
    }
  }

  function confirmDelete() {
    if (!item) return;
    Alert.alert('Eliminar fecha', 'La fecha se eliminará para los dos. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteDate.mutate(item.id, {
            onSuccess: () => router.back(),
            onError: () =>
              Alert.alert(
                'No se pudo eliminar la fecha',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextField
        placeholder="Nombre, por ejemplo Aniversario"
        maxLength={60}
        value={title}
        onChangeText={setTitle}
        autoFocus={!item}
      />
      <DateField value={date} onChange={setDate} placeholder="Elige la fecha" />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Se repite cada año</Text>
        <Switch
          value={repeatsYearly}
          onValueChange={setRepeatsYearly}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.surface}
        />
      </View>
      {saveFailed && (
        <Text variant="caption" tone="danger">
          No se pudo guardar la fecha. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
      <Button title="Guardar" onPress={save} loading={isSaving} disabled={!canSave} />
      {item && (
        <Button
          title="Eliminar"
          variant="secondary"
          onPress={confirmDelete}
          loading={deleteDate.isPending}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switchLabel: {
    flex: 1,
  },
});
