import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
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

  return (
    <Card>
      <Text variant="caption" tone="muted">
        Envía un toque
      </Text>
      <View style={styles.grid}>
        {NUDGE_KINDS.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            disabled={sendNudge.isPending}
            onPress={() => send(option.value)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text variant="emoji">{option.emoji}</Text>
            <Text variant="caption">{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {sendNudge.isError && (
        <Text variant="caption" tone="danger">
          No se pudo enviar el toque. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
      {sentKind && (
        <Text variant="caption" tone="primary">
          Enviaste {describeNudge(sentKind)} a {partnerName}.
        </Text>
      )}
      {lastReceived.data && (
        <Text variant="caption" tone="muted">
          {partnerName} te envió {describeNudge(lastReceived.data.kind)}{' '}
          {formatRelative(lastReceived.data.created_at)}.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.7,
  },
});
