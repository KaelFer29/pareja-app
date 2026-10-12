import { JoinCoupleForm } from '@/features/couple/components/join-couple-form';
import { Screen } from '@/shared/ui/screen';

export default function JoinScreen() {
  return (
    <Screen avoidKeyboard>
      <JoinCoupleForm />
    </Screen>
  );
}
