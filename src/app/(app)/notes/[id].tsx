import { useLocalSearchParams } from 'expo-router';
import { FileX } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { NoteEditor } from '@/features/notes/components/note-editor';
import { useNote } from '@/features/notes/hooks';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNote(id);

  if (note.isPending) {
    return <LoadingState />;
  }

  if (note.isError) {
    return <ErrorState title="No se pudo cargar la nota" onRetry={() => note.refetch()} />;
  }

  if (!note.data) {
    return <EmptyState icon={FileX} title="Esta nota ya no existe" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <NoteEditor coupleId={note.data.couple_id} note={note.data} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
