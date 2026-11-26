import { File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

export async function savePhotoToGallery(url: string) {
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  const destination = new File(Paths.cache, `pareja-download-${Date.now()}.jpg`);
  const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });

  try {
    await Asset.create(downloaded.uri);
  } finally {
    try {
      downloaded.delete();
    } catch {}
  }
}
