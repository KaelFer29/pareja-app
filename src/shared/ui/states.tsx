import { WifiOff } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';

import { Button } from './button';
import { EmptyState } from './empty-state';

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

type ErrorStateProps = {
  title: string;
  onRetry?: () => void;
};

export function ErrorState({ title, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description="Revisa tu conexión e inténtalo de nuevo."
      action={
        onRetry && <Button title="Reintentar" variant="secondary" size="sm" onPress={onRetry} />
      }
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
