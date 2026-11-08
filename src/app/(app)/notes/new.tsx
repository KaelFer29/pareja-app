import { useCouple } from '@/features/couple/couple-provider';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';

export default function NewNoteScreen() {
  const { couple } = useCouple();

  if (!couple) return null;

  return (
    <FormKeyboardAvoiding>
      <NoteEditor coupleId={couple.id} />
    </FormKeyboardAvoiding>
  );
}
