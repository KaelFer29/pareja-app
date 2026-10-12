import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { NoteEditor } from '@/features/notes/components/note-editor';
import { useNote } from '@/features/notes/hooks';
import { colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNote(id);

  if (note.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (note.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudo cargar la nota. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  if (!note.data) {
    return (
      <View style={styles.message}>
        <Text tone="muted" align="center">
          Esta nota ya no existe.
        </Text>
      </View>
    );
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
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    padding: spacing.lg,
  },
});
