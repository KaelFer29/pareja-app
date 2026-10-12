import { useLocalSearchParams } from 'expo-router';
import { ListX } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { ListDetail } from '@/features/lists/components/list-detail';
import { useList } from '@/features/lists/hooks';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useList(id);

  if (list.isPending) {
    return <LoadingState />;
  }

  if (list.isError) {
    return <ErrorState title="No se pudo cargar la lista" onRetry={() => list.refetch()} />;
  }

  if (!list.data) {
    return <EmptyState icon={ListX} title="Esta lista ya no existe" />;
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
});
