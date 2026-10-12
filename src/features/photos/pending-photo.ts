import type { LocalImage } from '@/shared/lib/image';

let pendingPhoto: LocalImage | null = null;

export function setPendingPhoto(image: LocalImage) {
  pendingPhoto = image;
}

export function getPendingPhoto() {
  return pendingPhoto;
}
