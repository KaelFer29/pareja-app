import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ListDetail } from '@/features/lists/components/list-detail';
import { useList } from '@/features/lists/hooks';
import { colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useList(id);

  if (list.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (list.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudo cargar la lista. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  if (!list.data) {
    return (
      <View style={styles.message}>
        <Text tone="muted" align="center">
          Esta lista ya no existe.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ListDetail list={list.data} />
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
