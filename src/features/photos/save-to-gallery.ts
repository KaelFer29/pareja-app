import { File } from 'expo-file-system';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

export async function savePhotoToGallery(url: string) {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  if (!cacheDirectory) {
    throw new Error('download_failed');
  }

  const path = `${cacheDirectory}pareja-download-${Date.now()}.jpg`;
  const downloaded = await downloadAsync(url, path);
  if (downloaded.status !== 200) {
    throw new Error('download_failed');
  }

  try {
    await MediaLibrary.createAssetAsync(downloaded.uri);
  } finally {
    try {
      new File(downloaded.uri).delete();
    } catch {
      // El archivo temporal no es critico si no se puede borrar.
    }
  }
}
