import { Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/theme';

import { Text } from './text';

const SIZE = 60;

type FabProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function Fab({ accessibilityLabel, onPress }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.text,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    color: colors.primaryText,
    fontSize: 32,
    lineHeight: 36,
  },
});
