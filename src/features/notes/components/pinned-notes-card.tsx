import { router } from 'expo-router';
import { Pin } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { useNotes } from '../hooks';

const MAX_NOTES = 3;

type PinnedNotesCardProps = {
  coupleId: string;
};

export function PinnedNotesCard({ coupleId }: PinnedNotesCardProps) {
  const notes = useNotes(coupleId);
  const pinned = (notes.data ?? []).filter((note) => note.pinned).slice(0, MAX_NOTES);

  if (pinned.length === 0) {
    return (
      <Card onPress={() => router.push('/notes')} style={styles.row}>
        <PinBadge />
        <Text tone="muted" style={styles.texts}>
          Fija una nota para tenerla siempre a mano aquí.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.list}>
      {pinned.map((note, index) => (
        <Pressable
          key={note.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/notes/[id]', params: { id: note.id } })}
          style={({ pressed }) => [
            styles.row,
            styles.item,
            index > 0 && styles.divider,
            pressed && styles.pressed,
          ]}
        >
          <PinBadge />
          <View style={styles.texts}>
            {note.title !== '' && (
              <Text variant="bodyStrong" numberOfLines={1}>
                {note.title}
              </Text>
            )}
            {note.content !== '' && (
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {note.content}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

function PinBadge() {
  return (
    <View style={styles.badge}>
      <Icon icon={Pin} size={18} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.xs,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  item: {
    paddingVertical: spacing.md - spacing.xs,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
