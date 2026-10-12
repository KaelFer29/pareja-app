import type { Tables } from '@/shared/lib/database.types';

export type MemberProfile = Pick<
  Tables<'profiles'>,
  'id' | 'display_name' | 'avatar_path' | 'mood'
>;

export type CoupleMember = Pick<Tables<'couple_members'>, 'user_id' | 'joined_at'> & {
  profile: MemberProfile | null;
};

export type Couple = Tables<'couples'> & {
  members: CoupleMember[];
};

export type StartedOnInput = {
  coupleId: string;
  startedOn: string;
};
