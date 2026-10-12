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

export type Mood = 'happy' | 'loving' | 'calm' | 'tired' | 'sad' | 'stressed';

export type UpdateMoodInput = {
  userId: string;
  mood: Mood | null;
};
