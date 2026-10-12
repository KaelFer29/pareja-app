import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

import { useNotes } from '../hooks';

const MAX_NOTES = 3;

type PinnedNotesCardProps = {
  coupleId: string;
};

export function PinnedNotesCard({ coupleId }: PinnedNotesCardProps) {
  const notes = useNotes(coupleId);
  const pinned = (notes.data ?? []).filter((note) => note.pinned).slice(0, MAX_NOTES);

  return (
    <Card>
      <Text variant="caption" tone="muted">
        Notas fijadas
      </Text>
      {pinned.length === 0 ? (
        <Text tone="muted">Fija una nota para tenerla siempre a mano aquí.</Text>
      ) : (
        pinned.map((note) => (
          <Pressable
            key={note.id}
            onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
            style={({ pressed }) => [styles.note, pressed && styles.pressed]}
          >
            {note.title !== '' && <Text variant="subtitle">{note.title}</Text>}
            {note.content !== '' && (
              <Text tone="muted" numberOfLines={2}>
                {note.content}
              </Text>
            )}
          </Pressable>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  note: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
});
