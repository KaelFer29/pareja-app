import { router } from 'expo-router';
import { Check, Repeat, Trash2 } from 'lucide-react-native';
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
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.card}>
        <TextField
          label="Nombre"
          placeholder="Por ejemplo, Aniversario"
          maxLength={60}
          value={title}
          onChangeText={setTitle}
          autoFocus={!item}
        />
        <DateField label="Fecha" value={date} onChange={setDate} placeholder="Elige la fecha" />
        <View style={styles.switchRow}>
          <View style={styles.switchIcon}>
            <Icon icon={Repeat} size={18} color={colors.accent} />
          </View>
          <View style={styles.switchTexts}>
            <Text variant="bodyStrong">Se repite cada año</Text>
            <Text variant="caption" tone="muted">
              Ideal para cumpleaños y aniversarios.
            </Text>
          </View>
          <Switch
            value={repeatsYearly}
            onValueChange={setRepeatsYearly}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.surface}
          />
        </View>
      </Card>
      {saveFailed && (
        <Notice message="No se pudo guardar la fecha. Revisa tu conexión e inténtalo de nuevo." />
      )}
      <Button title="Guardar" icon={Check} onPress={save} loading={isSaving} disabled={!canSave} />
      {item && (
        <Button
          title="Eliminar fecha"
          variant="danger"
          icon={Trash2}
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
});
