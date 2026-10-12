import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/shared/theme';

import { Text } from './text';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
  avoidKeyboard?: boolean;
  withTopInset?: boolean;
}>;

export const SCREEN_PADDING = spacing.md + spacing.xs;

export function Screen({
  children,
  title,
  subtitle,
  action,
  style,
  avoidKeyboard = false,
  withTopInset = true,
}: ScreenProps) {
  const content = (
    <View style={[styles.content, style]}>
      {title && <ScreenHeader title={title} subtitle={subtitle} action={action} />}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={withTopInset ? ['top', 'left', 'right'] : ['left', 'right']}
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.flex}>
        {subtitle && (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        )}
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md + spacing.xs,
  },
});
