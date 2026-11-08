import { useCouple } from '@/features/couple/couple-provider';
import { DateForm } from '@/features/dates/components/date-form';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';

export default function NewDateScreen() {
  const { couple } = useCouple();

  if (!couple) return null;

  return (
    <FormKeyboardAvoiding>
      <DateForm coupleId={couple.id} />
    </FormKeyboardAvoiding>
  );
}
