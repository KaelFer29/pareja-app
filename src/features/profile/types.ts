import type { Tables } from '@/shared/lib/database.types';
import type { LocalImage } from '@/shared/lib/image';

export type Profile = Tables<'profiles'>;

export type UpdateAvatarInput = {
  userId: string;
  image: LocalImage;
  previousPath: string | null;
};

export type UpdateProfileInput = {
  userId: string;
  displayName: string;
};

export type MoodState = {
  emoji: string | null;
  text: string | null;
};

export type UpdateMoodInput = {
  userId: string;
  emoji: string | null;
  text: string | null;
};
