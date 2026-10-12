import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type LocalImage = {
  uri: string;
  width: number;
  height: number;
};

export type ImageSource = 'library' | 'camera';

export class PermissionDeniedError extends Error {}

type PickOptions = {
  square?: boolean;
};

export async function pickImage(
  source: ImageSource,
  { square = false }: PickOptions = {},
): Promise<LocalImage | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new PermissionDeniedError(source);
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: square,
    aspect: square ? [1, 1] : undefined,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return null;

  const [asset] = result.assets;
  return { uri: asset.uri, width: asset.width, height: asset.height };
}

export async function compressImage(image: LocalImage, maxSide: number): Promise<LocalImage> {
  const context = ImageManipulator.manipulate(image.uri);

  if (image.width >= image.height && image.width > maxSide) {
    context.resize({ width: maxSide });
  } else if (image.height > maxSide) {
    context.resize({ height: maxSide });
  }

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
  return { uri: result.uri, width: result.width, height: result.height };
}
