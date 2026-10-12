import { Alert } from 'react-native';

import {
  PermissionDeniedError,
  pickImage,
  type ImageSource,
  type LocalImage,
} from '@/shared/lib/image';

type RequestImageOptions = {
  title: string;
  square?: boolean;
};

function chooseSource(title: string) {
  return new Promise<ImageSource | null>((resolve) => {
    Alert.alert(
      title,
      undefined,
      [
        { text: 'Elegir de la galería', onPress: () => resolve('library') },
        { text: 'Tomar foto', onPress: () => resolve('camera') },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

export async function requestImage({
  title,
  square,
}: RequestImageOptions): Promise<LocalImage | null> {
  const source = await chooseSource(title);
  if (!source) return null;

  try {
    return await pickImage(source, { square });
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      Alert.alert(
        'Falta un permiso',
        source === 'camera'
          ? 'Para tomar fotos, permite el acceso a la cámara en los ajustes del teléfono.'
          : 'Para elegir fotos, permite el acceso a tus fotos en los ajustes del teléfono.',
      );
      return null;
    }
    Alert.alert('No se pudo abrir la imagen', 'Inténtalo de nuevo.');
    return null;
  }
}
