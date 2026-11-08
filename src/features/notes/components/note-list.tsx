import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { NotebookPen, Pin } from 'lucide-react-native';
import { Alert, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors, fonts, noteColors, radius, spacing } from '@/shared/theme';
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

export function NoteList({ coupleId, authorNames }: NoteListProps) {
  const notes = useNotes(coupleId);
  const reorder = useReorderNotes(coupleId);

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

  function renderItem({ item, getIndex, drag, isActive }: RenderItemParams<Note>) {
    const index = getIndex() ?? 0;
    const side = index % 2 === 0 ? 'left' : 'right';

    return (
      <ScaleDecorator activeScale={1.03}>
        <View style={[styles.slot, side === 'left' ? styles.slotLeft : styles.slotRight]}>
          <StickyNote
            note={item}
            authorName={authorNames[item.author_id ?? ''] ?? 'Alguien'}
            dragging={isActive}
            onLongPress={() => {
              Haptics.selectionAsync();
              drag();
            }}
          />
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <GestureHandlerRootView style={styles.wrap}>
      <DraggableFlatList
        data={notes.data}
        keyExtractor={(item) => item.id}
        activationDistance={10}
        onDragBegin={() => Haptics.selectionAsync()}
        onDragEnd={({ data }) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          reorder.mutate(
            data.map((note) => note.id),
            {
              onError: () => {
                Alert.alert(
                  'No se pudo guardar el orden',
                  'Revisa tu conexión e inténtalo de nuevo.',
                );
              },
            },
          );
        }}
        containerStyle={styles.list}
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
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}

type StickyNoteProps = {
  note: Note;
  authorName: string;
  dragging: boolean;
  onLongPress: () => void;
};

function StickyNote({ note, authorName, dragging, onLongPress }: StickyNoteProps) {
  const palette = noteColors[noteColorOf(note)];
  const title = note.title || note.content.split('\n')[0];
  const body = note.title ? note.content : note.content.split('\n').slice(1).join('\n');
  const edited = wasEditedAfterCreate(note.created_at, note.updated_at);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      delayLongPress={220}
      onLongPress={onLongPress}
      onPress={() => {
        if (dragging) return;
        Haptics.selectionAsync();
        router.push({ pathname: '/notes/[id]', params: { id: note.id } });
      }}
      style={({ pressed }) => [
        styles.note,
        { backgroundColor: palette.paper, transform: [{ rotate: tiltFor(note.id) }] },
        (pressed || dragging) && styles.pressed,
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
        {authorName} · {formatChileDateTimeShort(note.created_at)}
        {edited ? ' · editada' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  slot: {
    width: '78%',
    marginBottom: spacing.md,
  },
  slotLeft: {
    alignSelf: 'flex-start',
  },
  slotRight: {
    alignSelf: 'flex-end',
  },
  note: {
    gap: spacing.xs,
    paddingTop: spacing.md + spacing.xs,
    paddingBottom: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
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
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.hand,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  meta: {
    marginTop: spacing.xs,
    fontSize: 12,
    opacity: 0.7,
  },
});
