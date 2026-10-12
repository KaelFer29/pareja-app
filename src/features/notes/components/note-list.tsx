import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { formatLongDate } from '@/shared/utils/date';

import { useNotes } from '../hooks';
import type { Note } from '../types';

type NoteListProps = {
  coupleId: string;
  authorNames: Record<string, string>;
};

export function NoteList({ coupleId, authorNames }: NoteListProps) {
  const notes = useNotes(coupleId);

  if (notes.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (notes.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudieron cargar las notas. Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <Button title="Reintentar" onPress={() => notes.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={notes.data}
      keyExtractor={(note) => note.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <NoteCard note={item} authorName={authorNames[item.author_id ?? ''] ?? 'Alguien'} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={notes.isRefetching}
          onRefresh={() => notes.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <Text tone="muted" align="center" style={styles.empty}>
          Aún no hay notas. Escribe la primera para compartirla con tu pareja.
        </Text>
      }
    />
  );
}

type NoteCardProps = {
  note: Note;
  authorName: string;
};

function NoteCard({ note, authorName }: NoteCardProps) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={note.pinned && styles.pinned}>
        {note.pinned && (
          <Text variant="caption" tone="primary">
            Fijada
          </Text>
        )}
        {note.title !== '' && <Text variant="subtitle">{note.title}</Text>}
        {note.content !== '' && <Text numberOfLines={3}>{note.content}</Text>}
        <Text variant="caption" tone="muted">
          {authorName} - {formatLongDate(note.updated_at)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl * 3,
  },
  pinned: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  empty: {
    marginTop: spacing.xl,
  },
});
