import { Check, Heart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
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

  return (
    <Card>
      <View style={styles.grid}>
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
              <Text variant="emoji">{option.emoji}</Text>
              <Text variant="caption" tone={isSent ? 'primary' : 'accent'} align="center">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {sendNudge.isError && (
        <Notice message="No se pudo enviar el toque. Revisa tu conexión e inténtalo de nuevo." />
      )}
      {sentKind ? (
        <View style={styles.footer}>
          <Icon icon={Check} size={16} color={colors.primary} strokeWidth={2.4} />
          <Text variant="caption" tone="primary" style={styles.footerText}>
            Enviaste {describeNudge(sentKind)} a {partnerName}
          </Text>
        </View>
      ) : (
        lastReceived.data && (
          <View style={styles.footer}>
            <Icon icon={Heart} size={16} color={colors.textMuted} />
            <Text variant="caption" tone="muted" style={styles.footerText}>
              {partnerName} te envió {describeNudge(lastReceived.data.kind)}{' '}
              {formatRelative(lastReceived.data.created_at)}
            </Text>
          </View>
        )
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md - spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  footerText: {
    flex: 1,
  },
});
