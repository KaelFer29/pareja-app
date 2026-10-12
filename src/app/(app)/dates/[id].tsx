import { useLocalSearchParams } from 'expo-router';
import { CalendarX } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { DateForm } from '@/features/dates/components/date-form';
import { useImportantDate } from '@/features/dates/hooks';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function DateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useImportantDate(id);

  if (item.isPending) {
    return <LoadingState />;
  }

  if (item.isError) {
    return <ErrorState title="No se pudo cargar la fecha" onRetry={() => item.refetch()} />;
  }

  if (!item.data) {
    return <EmptyState icon={CalendarX} title="Esta fecha ya no existe" />;
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
});
