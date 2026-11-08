import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export async function savePhotoToGallery(url: string) {
  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  const destination = new File(Paths.cache, `pareja-download-${Date.now()}.jpg`);
  const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });
  await MediaLibrary.saveToLibraryAsync(downloaded.uri);
  try {
    downloaded.delete();
  } catch {
    return;
  }
}
