import type { Tables } from '@/shared/lib/database.types';

export type Pet = Tables<'pets'>;

export type PetAction = 'feed' | 'pet' | 'play';

export type PetMood = 'happy' | 'calm' | 'hungry' | 'lonely' | 'sleepy';

export type PetStats = {
  fullness: number;
  happiness: number;
  level: number;
  progress: number;
  mood: PetMood;
};
