import type { Tables } from '@/shared/lib/database.types';
import type { LocalImage } from '@/shared/lib/image';

import type { NotificationPrefs } from './notification-prefs';

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

export type UpdateNotificationPrefsInput = {
  userId: string;
  prefs: NotificationPrefs;
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
