import type { Tables } from '@/shared/lib/database.types';

export type Nudge = Tables<'nudges'>;

export type NudgeKind = 'thinking_of_you' | 'miss_you' | 'love_you' | 'hug';

export type SendNudgeInput = {
  coupleId: string;
  kind: NudgeKind;
};
