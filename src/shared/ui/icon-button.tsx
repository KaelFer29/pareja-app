import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '@/shared/theme';

import { Icon } from './icon';

type IconButtonTone = 'default' | 'primary' | 'danger';

type IconButtonProps = {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  tone?: IconButtonTone;
  active?: boolean;
  disabled?: boolean;
  size?: number;
};

const palette: Record<IconButtonTone, { background: string; content: string }> = {
  default: { background: colors.surfaceMuted, content: colors.accent },
  primary: { background: colors.primarySoft, content: colors.primary },
  danger: { background: colors.dangerSoft, content: colors.danger },
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'default',
  active = false,
  disabled = false,
  size = 42,
}: IconButtonProps) {
  const { background, content } = palette[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active, disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, backgroundColor: active ? content : background },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Icon
        icon={icon}
        size={size * 0.46}
        color={active ? colors.primaryText : content}
        strokeWidth={2.1}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});
