import { router } from 'expo-router';

import { Fab } from '@/shared/ui/fab';
import { requestImage } from '@/shared/ui/request-image';

import { setPendingPhoto } from '../pending-photo';

export function AddPhotoButton() {
  async function addPhoto() {
    const image = await requestImage({ title: 'Agregar foto' });
    if (!image) return;

    setPendingPhoto(image);
    router.push('/photos/new');
  }

  return <Fab accessibilityLabel="Agregar foto" onPress={addPhoto} />;
}
