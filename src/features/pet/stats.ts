import type { PetAction } from './types';

export { getPetStats, MOOD_MESSAGES, MOOD_SHORT, stageLabel, STAGES } from '@/shared/utils/pet';

const ACTION_PAST: Record<PetAction, { mine: string; theirs: string }> = {
  feed: { mine: 'Le diste de comer a', theirs: 'le dio de comer a' },
  pet: { mine: 'Le hiciste mimos a', theirs: 'le hizo mimos a' },
  play: { mine: 'Jugaste con', theirs: 'jugó con' },
};

export function describeLastCare(action: PetAction, petName: string, actorName: string | null) {
  const phrase = ACTION_PAST[action];
  return actorName ? `${actorName} ${phrase.theirs} ${petName}` : `${phrase.mine} ${petName}`;
}

export function isPetAction(value: string | null): value is PetAction {
  return value === 'feed' || value === 'pet' || value === 'play';
}
