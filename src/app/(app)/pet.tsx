import { useAuth } from '@/features/auth/auth-provider';
import { useCouple } from '@/features/couple/couple-provider';
import { AdoptPet } from '@/features/pet/components/adopt-pet';
import { PetView } from '@/features/pet/components/pet-view';
import { usePet } from '@/features/pet/hooks';
import { Screen } from '@/shared/ui/screen';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function PetScreen() {
  const { session } = useAuth();
  const { couple } = useCouple();
  const pet = usePet(couple?.id);
  const userId = session?.user.id;

  const names = Object.fromEntries(
    (couple?.members ?? []).map((member) => [
      member.user_id,
      member.profile?.display_name || 'Tu pareja',
    ]),
  );

  return (
    <Screen withTopInset={false} avoidKeyboard>
      {pet.isPending ? (
        <LoadingState />
      ) : pet.isError ? (
        <ErrorState title="No se pudo cargar la mascota" onRetry={() => pet.refetch()} />
      ) : pet.data && userId ? (
        <PetView pet={pet.data} userId={userId} names={names} />
      ) : (
        <AdoptPet />
      )}
    </Screen>
  );
}
