import { createContext, useContext, type PropsWithChildren } from 'react';

import { useMyCouple } from './hooks';
import { useCoupleRealtime } from './realtime';
import type { Couple, CoupleMember } from './types';

type CoupleContextValue = {
  couple: Couple | null;
  partner: CoupleMember | null;
  isComplete: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

const CoupleContext = createContext<CoupleContextValue>({
  couple: null,
  partner: null,
  isComplete: false,
  isLoading: false,
  error: null,
  refetch: () => {},
});

type CoupleProviderProps = PropsWithChildren<{
  userId: string | null;
}>;

export function CoupleProvider({ userId, children }: CoupleProviderProps) {
  const query = useMyCouple(userId);
  const couple = query.data ?? null;
  const partner = couple?.members.find((member) => member.user_id !== userId) ?? null;

  useCoupleRealtime(couple?.id);

  const value: CoupleContextValue = {
    couple,
    partner,
    isComplete: (couple?.members.length ?? 0) === 2,
    isLoading: query.isLoading,
    error: query.error,
    refetch: () => {
      query.refetch();
    },
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCouple() {
  return useContext(CoupleContext);
}
