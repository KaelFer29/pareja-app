import { router } from 'expo-router';
import { NotebookPen, Pin } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatRelative } from '@/shared/utils/date';

import { useNotes } from '../hooks';
import type { Note } from '../types';

type NoteListProps = {
  coupleId: string;
  authorNames: Record<string, string>;
};

export function NoteList({ coupleId, authorNames }: NoteListProps) {
  const notes = useNotes(coupleId);

  if (notes.isPending) {
    return <LoadingState />;
  }

  if (notes.isError) {
    return <ErrorState title="No se pudieron cargar las notas" onRetry={() => notes.refetch()} />;
  }

  return (
    <FlatList
      data={notes.data}
      keyExtractor={(note) => note.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
        <EmptyState
          icon={NotebookPen}
          title="Aún no hay notas"
          description="Escribe la primera con el botón + para compartirla con tu pareja."
        />
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
    <Card onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}>
      <View style={styles.header}>
        <Text variant="heading" numberOfLines={1} style={styles.title}>
          {note.title || note.content.split('\n')[0]}
        </Text>
        {note.pinned && (
          <Icon icon={Pin} size={18} color={colors.primary} fill={colors.primarySoft} />
        )}
      </View>
      {note.title !== '' && note.content !== '' && (
        <Text tone="muted" numberOfLines={3}>
          {note.content}
        </Text>
      )}
      <Text variant="caption" tone="muted" style={styles.meta}>
        {authorName} · {formatRelative(note.updated_at)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md - spacing.xs,
    paddingBottom: spacing.xl * 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  meta: {
    marginTop: spacing.xs,
  },
});
