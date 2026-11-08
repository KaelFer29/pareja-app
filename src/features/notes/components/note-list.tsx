import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { GripVertical, NotebookPen, Pin } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, fonts, noteColors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatChileDateTimeShort, wasEditedAfterCreate } from '@/shared/utils/date';
import { tiltFor } from '@/shared/utils/tilt';

import { noteColorOf } from '../colors';
import { useNotes, useReorderNotes } from '../hooks';
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
  const reorder = useReorderNotes(coupleId);
  const [sorting, setSorting] = useState(false);
  const [draft, setDraft] = useState<Note[]>([]);

  const unpinned = useMemo(() => (notes.data ?? []).filter((note) => !note.pinned), [notes.data]);
  const pinned = useMemo(() => (notes.data ?? []).filter((note) => note.pinned), [notes.data]);

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

  if (sorting) {
    return (
      <View style={styles.sortWrap}>
        <Text variant="caption" tone="muted">
          Arrastra para ordenar. Las fijadas siguen arriba.
        </Text>
        <DraggableFlatList
          data={draft}
          keyExtractor={(item) => item.id}
          onDragBegin={() => Haptics.selectionAsync()}
          onDragEnd={({ data }) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDraft(data);
          }}
          containerStyle={styles.sortList}
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              <Pressable
                onLongPress={drag}
                disabled={isActive}
                style={[styles.sortRow, isActive && styles.sortActive]}
              >
                <Icon icon={GripVertical} size={18} color={colors.textMuted} />
                <Text style={styles.sortTitle} numberOfLines={1}>
                  {item.title || item.content.split('\n')[0] || 'Nota'}
                </Text>
              </Pressable>
            </ScaleDecorator>
          )}
        />
        <View style={styles.sortActions}>
          <Button title="Cancelar" variant="ghost" onPress={() => setSorting(false)} />
          <Button
            title="Guardar orden"
            loading={reorder.isPending}
            onPress={() => {
              const orderedIds = [
                ...pinned.map((note) => note.id),
                ...draft.map((note) => note.id),
              ];
              reorder.mutate(orderedIds, {
                onSuccess: () => setSorting(false),
                onError: () => {
                  Alert.alert(
                    'No se pudo guardar el orden',
                    'Revisa tu conexión e inténtalo de nuevo.',
                  );
                },
              });
            }}
          />
        </View>
      </View>
    );
  }

  const columns = splitColumns(notes.data);

  return (
    <View style={styles.wrap}>
      {unpinned.length > 1 && (
        <Button
          title="Ordenar"
          variant="ghost"
          size="sm"
          onPress={() => {
            setDraft(unpinned);
            setSorting(true);
          }}
        />
      )}
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
            {column.map((note, noteIndex) => (
              <Animated.View key={note.id} entering={FadeInDown.delay(noteIndex * 40)}>
                <StickyNote
                  note={note}
                  authorName={authorNames[note.author_id ?? ''] ?? 'Alguien'}
                />
              </Animated.View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
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
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: '/notes/[id]', params: { id: note.id } });
      }}
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
        {authorName},{' '}
        {wasEditedAfterCreate(note.created_at, note.updated_at)
          ? `editada ${formatChileDateTimeShort(note.updated_at)}`
          : formatChileDateTimeShort(note.created_at)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.sm,
  },
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
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  pin: {
    position: 'absolute',
    top: -6,
    right: 10,
  },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 54,
    height: 16,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    transform: [{ rotate: '-4deg' }],
  },
  title: {
    fontFamily: fonts.handBold,
    fontSize: 22,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.hand,
    fontSize: 18,
    lineHeight: 22,
    color: colors.text,
  },
  meta: {
    marginTop: spacing.xs,
    fontSize: 12,
    opacity: 0.7,
  },
  sortWrap: {
    flex: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  sortList: {
    flex: 1,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  sortActive: {
    backgroundColor: colors.primarySoft,
  },
  sortTitle: {
    flex: 1,
    color: colors.text,
  },
  sortActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
