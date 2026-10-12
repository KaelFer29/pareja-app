import type { Tables } from '@/shared/lib/database.types';

export type Reaction = Tables<'reactions'>;

export type ReactionTarget = {
  kind: 'photo' | 'note';
  id: string;
  coupleId: string;
};

export type ReactionChange = {
  target: ReactionTarget;
  emoji: string;
  current: Reaction | undefined;
};
