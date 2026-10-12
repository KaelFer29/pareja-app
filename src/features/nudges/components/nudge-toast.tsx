import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { describeNudge } from '../kinds';
import { useNudgesRealtime } from '../realtime';
import type { Nudge } from '../types';

const VISIBLE_MS = 4000;
const HIDDEN_OFFSET = -160;

type NudgeToastProps = {
  coupleId: string | undefined;
  userId: string | undefined;
  senderName: string;
};

export function NudgeToast({ coupleId, userId, senderName }: NudgeToastProps) {
  const insets = useSafeAreaInsets();
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [offset] = useState(() => new Animated.Value(HIDDEN_OFFSET));

  const hide = useCallback(() => {
    Animated.timing(offset, {
      toValue: HIDDEN_OFFSET,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setNudge(null));
  }, [offset]);

  useNudgesRealtime(coupleId, userId, setNudge);

  useEffect(() => {
    if (!nudge) return;
    Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start();
    const timeout = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [nudge, offset, hide]);

  if (!nudge) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + spacing.sm, transform: [{ translateY: offset }] },
      ]}
    >
      <Pressable onPress={hide} style={styles.toast}>
        <Text variant="caption" tone="muted">
          {senderName} te envió
        </Text>
        <Text variant="subtitle">{describeNudge(nudge.kind)}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  toast: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    gap: spacing.xs,
    elevation: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
