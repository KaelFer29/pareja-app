import { Heart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

type BrandMarkProps = {
  title: string;
  subtitle?: string;
};

export function BrandMark({ title, subtitle }: BrandMarkProps) {
  return (
    <View style={styles.container}>
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Icon icon={Heart} size={30} color={colors.primary} fill={colors.primary} />
        </View>
      </View>
      <View style={styles.texts}>
        <Text variant="title" align="center" accessibilityRole="header">
          {title}
        </Text>
        {subtitle && (
          <Text tone="muted" align="center">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  outer: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: spacing.xs,
    maxWidth: 300,
  },
});
