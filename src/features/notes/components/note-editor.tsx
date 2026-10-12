import { router, Stack } from 'expo-router';
import { Check, Pin, PinOff, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  colors,
  fonts,
  noteColors,
  radius,
  spacing,
  typography,
  type NoteColor,
} from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { Notice } from '@/shared/ui/notice';
import { SCREEN_PADDING } from '@/shared/ui/screen';

import { COLOR_LABELS, NOTE_COLOR_KEYS, noteColorOf } from '../colors';
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
  const [color, setColor] = useState<NoteColor>(note ? noteColorOf(note) : 'yellow');
  const palette = noteColors[color];
  const createNote = useCreateNote();
  const saveNote = useUpdateNote();
  const pinNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const isEmpty = title.trim() === '' && content.trim() === '';
  const hasChanges =
    !note || title !== note.title || content !== note.content || color !== noteColorOf(note);
  const isSaving = createNote.isPending || saveNote.isPending;
  const saveFailed = createNote.isError || saveNote.isError;

  function save() {
    const onSuccess = () => router.back();
    if (note) {
      saveNote.mutate({ id: note.id, title, content, color }, { onSuccess });
    } else {
      createNote.mutate({ coupleId, title, content, color }, { onSuccess });
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
        <View style={styles.swatches}>
          {NOTE_COLOR_KEYS.map((key) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={COLOR_LABELS[key]}
              accessibilityState={{ selected: key === color }}
              onPress={() => setColor(key)}
              hitSlop={4}
              style={[
                styles.swatch,
                { backgroundColor: noteColors[key].paper },
                key === color && { borderColor: noteColors[key].ink },
              ]}
            >
              {key === color && <Icon icon={Check} size={16} color={noteColors[key].ink} />}
            </Pressable>
          ))}
        </View>
        <View style={[styles.paper, { backgroundColor: palette.paper }]}>
          <View style={styles.tape} />
          <TextInput
            placeholder="Título"
            placeholderTextColor={palette.ink + '80'}
            selectionColor={palette.ink}
            cursorColor={palette.ink}
            maxLength={120}
            value={title}
            onChangeText={setTitle}
            style={[styles.title, { color: palette.ink }]}
          />
          <View style={[styles.separator, { backgroundColor: palette.ink + '33' }]} />
          <TextInput
            placeholder="Escribe tu nota"
            placeholderTextColor={palette.ink + '80'}
            selectionColor={palette.ink}
            cursorColor={palette.ink}
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
  swatches: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm + spacing.xs,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paper: {
    marginTop: spacing.sm,
    borderRadius: radius.sm / 2,
    borderBottomRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md + spacing.xs,
    paddingHorizontal: spacing.md + spacing.xs,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  tape: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 80,
    height: 22,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ rotate: '-3deg' }],
  },
  title: {
    fontFamily: fonts.handBold,
    fontSize: 30,
    lineHeight: 36,
    paddingVertical: spacing.xs,
  },
  separator: {
    height: 1,
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
