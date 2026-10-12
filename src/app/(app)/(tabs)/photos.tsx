import { useCouple } from '@/features/couple/couple-provider';
import { AddPhotoButton } from '@/features/photos/components/add-photo-button';
import { PhotoGrid } from '@/features/photos/components/photo-grid';
import { Screen } from '@/shared/ui/screen';

export default function PhotosScreen() {
  const { couple } = useCouple();

  return (
    <Screen title="Fotos" subtitle="Sus momentos juntos">
      {couple && <PhotoGrid coupleId={couple.id} />}
      <AddPhotoButton />
    </Screen>
  );
}
