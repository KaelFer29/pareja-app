import { router } from 'expo-router';
import { NotebookPen, Pin } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { colors, fonts, noteColors, radius, spacing } from '@/shared/theme';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatRelativeShort } from '@/shared/utils/date';
import { tiltFor } from '@/shared/utils/tilt';

import { noteColorOf } from '../colors';
import { useNotes } from '../hooks';
import type { Note } from '../types';

type NoteListProps = {
  coupleId: string;
  authorNames: Record<string, string>;
};

function estimateHeight(note: Note) {
  const lines = Math.min(6, Math.ceil(note.content.length / 18));
  return 70 + (note.title ? 30 : 0) + lines * 20;
}

function splitColumns(notes: Note[]) {
  const columns: [Note[], Note[]] = [[], []];
  const heights = [0, 0];
  for (const note of notes) {
    const target = heights[0] <= heights[1] ? 0 : 1;
    columns[target].push(note);
    heights[target] += estimateHeight(note);
  }
  return columns;
}

export function NoteList({ coupleId, authorNames }: NoteListProps) {
  const notes = useNotes(coupleId);

  if (notes.isPending) {
    return <LoadingState />;
  }

  if (notes.isError) {
    return <ErrorState title="No se pudieron cargar las notas" onRetry={() => notes.refetch()} />;
  }

  if (notes.data.length === 0) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="Aún no hay notas"
        description="Pega la primera con el botón + para compartirla con tu pareja."
      />
    );
  }

  const columns = splitColumns(notes.data);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={notes.isRefetching}
          onRefresh={() => notes.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {columns.map((column, index) => (
        <View key={index} style={styles.column}>
          {column.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              authorName={authorNames[note.author_id ?? ''] ?? 'Alguien'}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

type StickyNoteProps = {
  note: Note;
  authorName: string;
};

function StickyNote({ note, authorName }: StickyNoteProps) {
  const palette = noteColors[noteColorOf(note)];
  const title = note.title || note.content.split('\n')[0];
  const body = note.title ? note.content : note.content.split('\n').slice(1).join('\n');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
      style={({ pressed }) => [
        styles.note,
        { backgroundColor: palette.paper, transform: [{ rotate: tiltFor(note.id) }] },
        pressed && styles.pressed,
      ]}
    >
      {note.pinned ? (
        <View style={styles.pin}>
          <Icon icon={Pin} size={18} color={colors.primary} fill={colors.primarySoft} />
        </View>
      ) : (
        <View style={styles.tape} />
      )}
      <Text style={[styles.title, { color: palette.ink }]} numberOfLines={note.title ? 2 : 4}>
        {title}
      </Text>
      {body.trim() !== '' && (
        <Text style={styles.body} numberOfLines={6}>
          {body.trim()}
        </Text>
      )}
      <Text style={[styles.meta, { color: palette.ink }]} numberOfLines={1}>
        {authorName}, {formatRelativeShort(note.updated_at)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xxs,
    paddingBottom: spacing.xl * 3,
  },
  column: {
    flex: 1,
    gap: spacing.lg,
  },
  note: {
    gap: spacing.xs,
    paddingTop: spacing.md + spacing.xs,
    paddingBottom: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.sm + spacing.xs,
    borderRadius: radius.sm / 2,
    borderBottomRightRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 54,
    height: 18,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ rotate: '-4deg' }],
  },
  pin: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  title: {
    fontFamily: fonts.handBold,
    fontSize: 23,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  meta: {
    marginTop: spacing.xs,
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.7,
  },
});
