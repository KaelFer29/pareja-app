import { Plus, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing } from '@/shared/theme';

import { Icon } from './icon';

const SIZE = 58;

type FabProps = {
  accessibilityLabel: string;
  onPress: () => void;
  icon?: LucideIcon;
};

export function Fab({ accessibilityLabel, onPress, icon = Plus }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
      ]}
    >
      <Icon icon={icon} size={26} color={colors.primaryText} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.md + spacing.xs,
    bottom: spacing.md + spacing.xs,
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
    shadowColor: colors.primary,
  },
});
