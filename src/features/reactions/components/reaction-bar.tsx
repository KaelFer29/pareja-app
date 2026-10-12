import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { REACTION_EMOJIS } from '../emojis';
import { useChangeReaction, useReactions } from '../hooks';
import type { ReactionTarget } from '../types';

type ReactionBarProps = {
  target: ReactionTarget;
  userId: string;
  partnerName: string;
};

export function ReactionBar({ target, userId, partnerName }: ReactionBarProps) {
  const reactions = useReactions(target);
  const changeReaction = useChangeReaction(userId);
  const mine = reactions.data?.find((reaction) => reaction.user_id === userId);
  const theirs = reactions.data?.find((reaction) => reaction.user_id !== userId);

  function react(emoji: string) {
    changeReaction.mutate(
      { target, emoji, current: mine },
      {
        onError: () =>
          Alert.alert('No se pudo reaccionar', 'Revisa tu conexión e inténtalo de nuevo.'),
      },
    );
  }

  const summary = [
    theirs && `${partnerName} reaccionó ${theirs.emoji}`,
    mine && `Tú reaccionaste ${mine.emoji}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {REACTION_EMOJIS.map((emoji) => {
          const selected = mine?.emoji === emoji;
          const fromPartner = theirs?.emoji === emoji;
          return (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={selected ? `Quitar reacción ${emoji}` : `Reaccionar ${emoji}`}
              accessibilityState={{ selected }}
              onPress={() => react(emoji)}
              hitSlop={4}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              {fromPartner && <View style={styles.partnerDot} />}
            </Pressable>
          );
        })}
      </View>
      <Text variant="caption" tone="muted" align="center">
        {summary || 'Toca un emoji para reaccionar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    padding: spacing.xs + spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pressed: {
    transform: [{ scale: 0.9 }],
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  partnerDot: {
    position: 'absolute',
    bottom: 1,
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
