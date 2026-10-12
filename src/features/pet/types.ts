import type { Tables } from '@/shared/lib/database.types';

export type { PetMood, PetStage, PetStats } from '@/shared/utils/pet';

export type Pet = Tables<'pets'>;

export type PetAction = 'feed' | 'pet' | 'play';
