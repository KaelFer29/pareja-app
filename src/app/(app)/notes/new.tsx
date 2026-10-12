import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { NoteEditor } from '@/features/notes/components/note-editor';

export default function NewNoteScreen() {
  const { couple } = useCouple();

  if (!couple) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <NoteEditor coupleId={couple.id} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
