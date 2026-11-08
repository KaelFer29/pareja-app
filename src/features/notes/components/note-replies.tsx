import { Pencil, Send, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { formatChileDateTime, wasEditedAfterCreate } from '@/shared/utils/date';

import {
  useCreateNoteReply,
  useDeleteNoteReply,
  useNoteReplies,
  useUpdateNoteReply,
} from '../hooks';
import type { NoteReply } from '../types';

type NoteRepliesProps = {
  coupleId: string;
  noteId: string;
  userId: string;
};

export function NoteReplies({ coupleId, noteId, userId }: NoteRepliesProps) {
  const replies = useNoteReplies(noteId);
  const createReply = useCreateNoteReply();
  const updateReply = useUpdateNoteReply();
  const deleteReply = useDeleteNoteReply(noteId);
  const { couple } = useCouple();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  function authorName(reply: NoteReply) {
    if (reply.author_id === userId) return 'Tú';
    const member = couple?.members.find((item) => item.user_id === reply.author_id);
    return member?.profile?.display_name || 'Tu pareja';
  }

  function send() {
    const content = draft.trim();
    if (!content) return;
    createReply.mutate(
      { coupleId, noteId, content },
      {
        onSuccess: () => setDraft(''),
        onError: () =>
          Alert.alert('No se pudo enviar la respuesta', 'Revisa tu conexión e inténtalo de nuevo.'),
      },
    );
  }

  function saveEdit(id: string) {
    const content = editingText.trim();
    if (!content) return;
    updateReply.mutate(
      { id, content },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingText('');
        },
        onError: () =>
          Alert.alert(
            'No se pudo guardar la respuesta',
            'Revisa tu conexión e inténtalo de nuevo.',
          ),
      },
    );
  }

  function confirmDelete(id: string) {
    Alert.alert('Eliminar respuesta', 'La respuesta se eliminará para los dos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteReply.mutate(id, {
            onError: () =>
              Alert.alert(
                'No se pudo eliminar la respuesta',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text variant="heading">Respuestas</Text>
      {(replies.data ?? []).map((reply) => {
        const editing = editingId === reply.id;
        return (
          <View key={reply.id} style={styles.card}>
            {editing ? (
              <>
                <TextField
                  value={editingText}
                  onChangeText={setEditingText}
                  multiline
                  maxLength={2000}
                  style={styles.field}
                />
                <View style={styles.row}>
                  <IconButton
                    icon={X}
                    accessibilityLabel="Cancelar edición"
                    onPress={() => setEditingId(null)}
                  />
                  <Button
                    title="Guardar"
                    onPress={() => saveEdit(reply.id)}
                    loading={updateReply.isPending}
                    disabled={editingText.trim() === ''}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.content}>{reply.content}</Text>
                <Text variant="caption" tone="muted">
                  {authorName(reply)} · {formatChileDateTime(reply.created_at)}
                  {wasEditedAfterCreate(reply.created_at, reply.updated_at)
                    ? ` · editada ${formatChileDateTime(reply.updated_at)}`
                    : ''}
                </Text>
                <View style={styles.row}>
                  <IconButton
                    icon={Pencil}
                    tone="primary"
                    size={34}
                    accessibilityLabel="Editar respuesta"
                    onPress={() => {
                      setEditingId(reply.id);
                      setEditingText(reply.content);
                    }}
                  />
                  <IconButton
                    icon={Trash2}
                    tone="danger"
                    size={34}
                    accessibilityLabel="Eliminar respuesta"
                    onPress={() => confirmDelete(reply.id)}
                  />
                </View>
              </>
            )}
          </View>
        );
      })}
      <TextField
        label="Tu respuesta"
        placeholder="Escribe una respuesta"
        value={draft}
        onChangeText={setDraft}
        multiline
        maxLength={2000}
        style={styles.field}
      />
      <Button
        title="Responder"
        icon={Send}
        onPress={send}
        loading={createReply.isPending}
        disabled={draft.trim() === ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.sm + spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  field: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
