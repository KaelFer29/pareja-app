import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { NotebookPen, Pin } from 'lucide-react-native';
import { Alert, RefreshControl, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable, { type SortableGridRenderItem } from 'react-native-sortables';

import { colors, noteColors, radius, spacing, typography } from '@/shared/theme';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatChileDateTimeShort, wasEditedAfterCreate } from '@/shared/utils/date';
import { withGlyphRoom } from '@/shared/utils/handwriting';
import { tiltFor } from '@/shared/utils/tilt';

import { noteColorOf } from '../colors';
import { useNotes, useReorderNotes } from '../hooks';
import type { Note } from '../types';

const COLUMNS = 2;
const NOTE_HEIGHT = 168;

type NoteListProps = {
  coupleId: string;
  authorNames: Record<string, string>;
};

function pinnedFirst(notes: Note[]) {
  return [...notes.filter((note) => note.pinned), ...notes.filter((note) => !note.pinned)];
}

export function NoteList({ coupleId, authorNames }: NoteListProps) {
  const notes = useNotes(coupleId);
  const reorder = useReorderNotes(coupleId);
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();

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

  const renderItem: SortableGridRenderItem<Note> = ({ item }) => (
    <StickyNote note={item} authorName={authorNames[item.author_id ?? ''] ?? 'Alguien'} />
  );

  function saveOrder(ordered: Note[]) {
    const ids = pinnedFirst(ordered).map((note) => note.id);
    const current = notes.data?.map((note) => note.id) ?? [];
    if (ids.join() === current.join()) return;
    reorder.mutate(ids, {
      onError: () => {
        Alert.alert('No se pudo guardar el orden', 'Revisa tu conexión e inténtalo de nuevo.');
      },
    });
  }

  return (
    <GestureHandlerRootView style={styles.wrap}>
      <Animated.ScrollView
        ref={scrollableRef}
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
        <Sortable.Grid
          data={notes.data}
          keyExtractor={(note) => note.id}
          renderItem={renderItem}
          columns={COLUMNS}
          rowGap={spacing.md}
          columnGap={spacing.md}
          scrollableRef={scrollableRef}
          activeItemScale={1.05}
          inactiveItemOpacity={0.85}
          onDragStart={() => Haptics.selectionAsync()}
          onDragEnd={({ data }) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            saveOrder(data);
          }}
        />
      </Animated.ScrollView>
    </GestureHandlerRootView>
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
  const edited = wasEditedAfterCreate(note.created_at, note.updated_at);

  return (
    <Sortable.Touchable
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      onTap={() => {
        Haptics.selectionAsync();
        router.push({ pathname: '/notes/[id]', params: { id: note.id } });
      }}
      style={[
        styles.note,
        { backgroundColor: palette.paper, transform: [{ rotate: tiltFor(note.id) }] },
      ]}
    >
      {note.pinned ? (
        <View style={styles.pin}>
          <Icon icon={Pin} size={16} color={colors.primary} fill={colors.primarySoft} />
        </View>
      ) : (
        <View style={styles.tape} />
      )}
      <Text style={[styles.title, { color: palette.ink }]} numberOfLines={2}>
        {withGlyphRoom(title)}
      </Text>
      <View style={styles.bodyArea}>
        {body.trim() !== '' && (
          <Text style={styles.body} numberOfLines={3}>
            {withGlyphRoom(body.trim())}
          </Text>
        )}
      </View>
      <Text style={[styles.meta, { color: palette.ink }]} numberOfLines={1}>
        {authorName} · {formatChileDateTimeShort(note.created_at)}
        {edited ? ' · editada' : ''}
      </Text>
    </Sortable.Touchable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  note: {
    height: NOTE_HEIGHT,
    gap: spacing.xxs,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm + spacing.xs,
    borderRadius: radius.sm / 2,
  },
  pin: {
    position: 'absolute',
    top: -spacing.sm,
    right: spacing.sm,
  },
  tape: {
    position: 'absolute',
    top: -spacing.sm,
    alignSelf: 'center',
    width: 44,
    height: 14,
    borderRadius: radius.hairline,
    backgroundColor: colors.tape,
    transform: [{ rotate: '-4deg' }],
  },
  title: {
    ...typography.noteTitle,
  },
  bodyArea: {
    flex: 1,
    overflow: 'hidden',
  },
  body: {
    ...typography.noteBody,
    color: colors.text,
  },
  meta: {
    ...typography.micro,
    opacity: 0.7,
  },
});
