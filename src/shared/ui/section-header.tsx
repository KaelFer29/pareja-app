import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';

import { Text } from './text';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="label" tone="muted" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
          {({ pressed }) => (
            <Text variant="caption" tone="primary" style={pressed && styles.pressed}>
              {actionLabel}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: -spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
});
