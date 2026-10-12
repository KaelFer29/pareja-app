import type { PetMood, PetStage } from '@/shared/utils/pet';

export type WidgetPhoto = {
  id: string;
  url: string;
  caption: string | null;
  authorName: string | null;
  createdAt: string;
};

export type WidgetCouple = {
  startedOn: string | null;
  myName: string;
  partnerName: string;
};

export type WidgetAgendaItem = {
  key: string;
  kind: 'plan' | 'special';
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  startTime: string | null;
  endTime: string | null;
  years: number | null;
};

export type WidgetPet = {
  name: string;
  mood: PetMood;
  stage: PetStage;
  level: number;
  streak: number;
  caredToday: boolean;
};

export type WidgetNextDate = {
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  years: number | null;
};
