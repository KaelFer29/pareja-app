import { Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { hasMood } from '../moods';

type MoodEmojiProps = {
  emoji: string | null | undefined;
  text?: string | null | undefined;
  editable?: boolean;
  size?: number;
};

export function MoodEmoji({ emoji, text, editable = false, size = 26 }: MoodEmojiProps) {
  const active = hasMood(emoji, text);
  if (!active && !editable) return null;

  return (
    <View style={[styles.bubble, shadows.card, { width: size, height: size }]}>
      {active ? (
        <Text style={{ fontSize: size * 0.58, lineHeight: size * 0.8 }}>{emoji || '💬'}</Text>
      ) : (
        <Icon icon={Plus} size={size * 0.6} color={colors.primary} strokeWidth={2.6} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
