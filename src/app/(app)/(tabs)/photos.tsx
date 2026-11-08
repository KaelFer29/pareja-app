import { useAuth } from '@/features/auth/auth-provider';
import { useCouple } from '@/features/couple/couple-provider';
import { AddPhotoButton } from '@/features/photos/components/add-photo-button';
import { PhotoGrid } from '@/features/photos/components/photo-grid';
import { Screen } from '@/shared/ui/screen';

export default function PhotosScreen() {
  const { couple } = useCouple();
  const { session } = useAuth();

  return (
    <Screen title="Fotos" subtitle="Sus momentos juntos">
      {couple && session && <PhotoGrid coupleId={couple.id} userId={session.user.id} />}
      <AddPhotoButton />
    </Screen>
  );
}
