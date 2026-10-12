import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';
import { formatRelative } from '@/shared/utils/date';

import { useLastReceivedNudge, useSendNudge } from '../hooks';
import { describeNudge, NUDGE_KINDS } from '../kinds';
import type { NudgeKind } from '../types';

const SENT_FEEDBACK_MS = 2500;

type NudgeCardProps = {
  coupleId: string;
  userId: string;
  partnerName: string;
};

export function NudgeCard({ coupleId, userId, partnerName }: NudgeCardProps) {
  const sendNudge = useSendNudge();
  const lastReceived = useLastReceivedNudge(coupleId, userId);
  const [sentKind, setSentKind] = useState<NudgeKind | null>(null);

  useEffect(() => {
    if (!sentKind) return;
    const timeout = setTimeout(() => setSentKind(null), SENT_FEEDBACK_MS);
    return () => clearTimeout(timeout);
  }, [sentKind]);

  function send(kind: NudgeKind) {
    sendNudge.mutate({ coupleId, kind }, { onSuccess: () => setSentKind(kind) });
  }

  const status = sentKind
    ? `Enviaste ${describeNudge(sentKind)}`
    : lastReceived.data
      ? `Te envió ${describeNudge(lastReceived.data.kind)} ${formatRelative(lastReceived.data.created_at)}`
      : 'Toca un emoji para enviarlo';

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.texts}>
          <Text variant="bodyStrong" numberOfLines={1}>
            Toque a {partnerName}
          </Text>
          <Text variant="caption" tone={sentKind ? 'primary' : 'muted'} numberOfLines={2}>
            {status}
          </Text>
        </View>
        <View style={styles.options}>
          {NUDGE_KINDS.map((option) => {
            const isSent = sentKind === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Enviar ${option.label}`}
                disabled={sendNudge.isPending}
                onPress={() => send(option.value)}
                style={({ pressed }) => [styles.option, (pressed || isSent) && styles.optionActive]}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {sendNudge.isError && (
        <Notice message="No se pudo enviar el toque. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md - spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.xs + spacing.xxs,
  },
  option: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
    transform: [{ scale: 1.08 }],
  },
  emoji: {
    fontSize: 21,
    lineHeight: 28,
  },
});
