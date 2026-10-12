import { Heart } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
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
      <Pressable onPress={hide} style={styles.toast} accessibilityRole="alert">
        <View style={styles.badge}>
          <Icon icon={Heart} size={20} color={colors.primary} fill={colors.primary} />
        </View>
        <View style={styles.texts}>
          <Text variant="caption" tone="muted">
            {senderName} te envió
          </Text>
          <Text variant="heading">{describeNudge(nudge.kind)}</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md - spacing.xs,
    ...shadows.floating,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
});
