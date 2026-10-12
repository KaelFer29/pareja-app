import { router, Stack } from 'expo-router';
import { Check, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, shadows, spacing, typography } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Notice } from '@/shared/ui/notice';
import { SCREEN_PADDING } from '@/shared/ui/screen';

import { useCreateNote, useDeleteNote, useUpdateNote } from '../hooks';
import type { Note } from '../types';

type NoteEditorProps = {
  coupleId: string;
  note?: Note;
  footer?: React.ReactNode;
};

export function NoteEditor({ coupleId, note, footer }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const createNote = useCreateNote();
  const saveNote = useUpdateNote();
  const pinNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const isEmpty = title.trim() === '' && content.trim() === '';
  const hasChanges = !note || title !== note.title || content !== note.content;
  const isSaving = createNote.isPending || saveNote.isPending;
  const saveFailed = createNote.isError || saveNote.isError;

  function save() {
    const onSuccess = () => router.back();
    if (note) {
      saveNote.mutate({ id: note.id, title, content }, { onSuccess });
    } else {
      createNote.mutate({ coupleId, title, content }, { onSuccess });
    }
  }

  function togglePinned() {
    if (!note) return;
    pinNote.mutate(
      { id: note.id, pinned: !note.pinned },
      {
        onError: () =>
          Alert.alert('No se pudo fijar la nota', 'Revisa tu conexión e inténtalo de nuevo.'),
      },
    );
  }

  function confirmDelete() {
    if (!note) return;
    Alert.alert('Eliminar nota', 'La nota se eliminará para los dos. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteNote.mutate(note.id, {
            onSuccess: () => router.back(),
            onError: () =>
              Alert.alert(
                'No se pudo eliminar la nota',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <>
      {note && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <View style={styles.headerActions}>
                <IconButton
                  icon={note.pinned ? PinOff : Pin}
                  tone="primary"
                  size={38}
                  active={note.pinned}
                  disabled={pinNote.isPending}
                  accessibilityLabel={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                  onPress={togglePinned}
                />
                <IconButton
                  icon={Trash2}
                  tone="danger"
                  size={38}
                  disabled={deleteNote.isPending}
                  accessibilityLabel="Eliminar nota"
                  onPress={confirmDelete}
                />
              </View>
            ),
          }}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paper}>
          <TextInput
            placeholder="Título"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            maxLength={120}
            value={title}
            onChangeText={setTitle}
            style={styles.title}
          />
          <View style={styles.separator} />
          <TextInput
            placeholder="Escribe tu nota"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            maxLength={10000}
            multiline
            value={content}
            onChangeText={setContent}
            style={styles.body}
            autoFocus={!note}
          />
        </View>
        {footer}
        {saveFailed && (
          <Notice message="No se pudo guardar la nota. Revisa tu conexión e inténtalo de nuevo." />
        )}
        <Button
          title="Guardar"
          icon={Check}
          onPress={save}
          loading={isSaving}
          disabled={isEmpty || !hasChanges}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  paper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + spacing.xs,
    ...shadows.card,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 28,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  body: {
    ...typography.body,
    lineHeight: 25,
    color: colors.text,
    minHeight: 260,
    textAlignVertical: 'top',
    paddingVertical: spacing.xs,
  },
});
