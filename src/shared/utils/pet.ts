import type { Tables } from '@/shared/lib/database.types';

import { addDays, toDay } from './date';

export type PetMood = 'happy' | 'calm' | 'hungry' | 'lonely' | 'sleepy';

export type PetStage = 'baby' | 'puppy' | 'adult';

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

const FULLNESS_PER_HOUR = 4;
const HAPPINESS_PER_HOUR = 3;
const XP_PER_LEVEL = 100;

export const STAGES: { stage: PetStage; fromLevel: number; label: string }[] = [
  { stage: 'baby', fromLevel: 1, label: 'Perrito recién nacido' },
  { stage: 'puppy', fromLevel: 4, label: 'Cachorro' },
  { stage: 'adult', fromLevel: 8, label: 'Perrito adulto' },
];

function stageFor(level: number) {
  let index = 0;
  STAGES.forEach((item, position) => {
    if (level >= item.fromLevel) index = position;
  });
  return { stage: STAGES[index].stage, next: STAGES[index + 1]?.fromLevel ?? null };
}

export function stageLabel(stage: PetStage) {
  return STAGES.find((item) => item.stage === stage)?.label ?? 'Perrito';
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function moodFor(fullness: number, happiness: number, now: Date): PetMood {
  if (fullness < 25) return 'hungry';
  if (happiness < 25) return 'lonely';
  const hour = now.getHours();
  if (hour >= 23 || hour < 7) return 'sleepy';
  if (fullness >= 70 && happiness >= 70) return 'happy';
  return 'calm';
}

export function getPetStats(pet: Tables<'pets'>, now = new Date()): PetStats {
  const hours = Math.max(0, (now.getTime() - new Date(pet.updated_at).getTime()) / 3_600_000);
  const fullness = clamp(pet.fullness - hours * FULLNESS_PER_HOUR);
  const happiness = clamp(pet.happiness - hours * HAPPINESS_PER_HOUR);

  const level = Math.floor(pet.xp / XP_PER_LEVEL) + 1;
  const { stage, next } = stageFor(level);
  const today = toDay(now);
  const yesterday = toDay(addDays(now, -1));
  const caredToday = pet.last_care_on === today;
  const streakAlive = caredToday || pet.last_care_on === yesterday;

  return {
    fullness,
    happiness,
    level,
    progress: (pet.xp % XP_PER_LEVEL) / XP_PER_LEVEL,
    mood: moodFor(fullness, happiness, now),
    stage,
    nextStageLevel: next,
    streak: streakAlive ? pet.streak : 0,
    caredToday,
  };
}

export const MOOD_MESSAGES: Record<PetMood, (name: string) => string> = {
  happy: (name) => `${name} está feliz de tenerlos.`,
  calm: (name) => `${name} está tranquilo. Un mimo nunca está de más.`,
  hungry: (name) => `${name} tiene hambre. Denle algo rico.`,
  lonely: (name) => `${name} los extraña. Jueguen un rato juntos.`,
  sleepy: (name) => `${name} está durmiendo. Shhh.`,
};

export const MOOD_SHORT: Record<PetMood, string> = {
  happy: 'Feliz',
  calm: 'Tranquilo',
  hungry: 'Con hambre',
  lonely: 'Los extraña',
  sleepy: 'Durmiendo',
};
