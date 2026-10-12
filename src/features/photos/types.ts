import type { Tables } from '@/shared/lib/database.types';
import type { LocalImage } from '@/shared/lib/image';

export type PhotoRow = Tables<'photos'>;

export type Photo = PhotoRow & {
  url: string | null;
};

export type PhotoPage = {
  photos: Photo[];
  nextCursor: string | null;
};

export type NewPhotoInput = {
  coupleId: string;
  image: LocalImage;
  caption: string;
};
