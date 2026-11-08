import { useLocalSearchParams } from 'expo-router';
import { FileX } from 'lucide-react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { useCouple } from '@/features/couple/couple-provider';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { NoteReplies } from '@/features/notes/components/note-replies';
import { useNote } from '@/features/notes/hooks';
import { useDismissNotificationsForPath } from '@/features/notifications/hooks';
import { ReactionBar } from '@/features/reactions/components/reaction-bar';
import { EmptyState } from '@/shared/ui/empty-state';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { View } from 'react-native';

import { spacing } from '@/shared/theme';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useDismissNotificationsForPath(id ? `/notes/${id}` : undefined);
  const note = useNote(id);
  const { session } = useAuth();
  const { partner } = useCouple();
  const userId = session?.user.id ?? '';

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
    <FormKeyboardAvoiding>
      <NoteEditor
        coupleId={note.data.couple_id}
        note={note.data}
        footer={
          <View style={{ gap: spacing.md }}>
            <ReactionBar
              target={{ kind: 'note', id: note.data.id, coupleId: note.data.couple_id }}
              userId={userId}
              partnerName={partner?.profile?.display_name || 'Tu pareja'}
            />
            <NoteReplies coupleId={note.data.couple_id} noteId={note.data.id} userId={userId} />
          </View>
        }
      />
    </FormKeyboardAvoiding>
  );
}
