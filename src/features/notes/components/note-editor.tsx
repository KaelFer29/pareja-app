import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useCreateNote, useDeleteNote, useUpdateNote } from '../hooks';
import type { Note } from '../types';

type NoteEditorProps = {
  coupleId: string;
  note?: Note;
};

export function NoteEditor({ coupleId, note }: NoteEditorProps) {
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
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TextField
        placeholder="Título"
        maxLength={120}
        value={title}
        onChangeText={setTitle}
        style={styles.title}
      />
      <TextField
        placeholder="Escribe tu nota"
        maxLength={10000}
        multiline
        value={content}
        onChangeText={setContent}
        style={styles.body}
        autoFocus={!note}
      />
      {saveFailed && (
        <Text variant="caption" tone="danger">
          No se pudo guardar la nota. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
      <Button title="Guardar" onPress={save} loading={isSaving} disabled={isEmpty || !hasChanges} />
      {note && (
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              title={note.pinned ? 'Desfijar' : 'Fijar'}
              variant="secondary"
              onPress={togglePinned}
              loading={pinNote.isPending}
            />
          </View>
          <View style={styles.action}>
            <Button
              title="Eliminar"
              variant="secondary"
              onPress={confirmDelete}
              loading={deleteNote.isPending}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  body: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
