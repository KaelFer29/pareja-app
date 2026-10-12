import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { DateForm } from '@/features/dates/components/date-form';
import { useImportantDate } from '@/features/dates/hooks';
import { colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

export default function DateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useImportantDate(id);

  if (item.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (item.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudo cargar la fecha. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  if (!item.data) {
    return (
      <View style={styles.message}>
        <Text tone="muted" align="center">
          Esta fecha ya no existe.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DateForm coupleId={item.data.couple_id} item={item.data} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    padding: spacing.lg,
  },
});
