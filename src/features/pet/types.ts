import type { Tables } from '@/shared/lib/database.types';

export type Pet = Tables<'pets'>;

export type PetAction = 'feed' | 'pet' | 'play';

export type PetMood = 'happy' | 'calm' | 'hungry' | 'lonely' | 'sleepy';

export type PetStage = 'baby' | 'young' | 'teen' | 'adult';

export type PetStats = {
  fullness: number;
  happiness: number;
  level: number;
  progress: number;
  mood: PetMood;
  stage: PetStage;
  nextStageLevel: number | null;
  streak: number;
  caredToday: boolean;
};
