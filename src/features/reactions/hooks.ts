import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { changeReaction, listReactions } from './api';
import type { Reaction, ReactionChange, ReactionTarget } from './types';

export const reactionKeys = {
  all: ['reactions'] as const,
  target: (target: ReactionTarget) => [...reactionKeys.all, target.kind, target.id] as const,
};

export function useReactions(target: ReactionTarget) {
  return useQuery({
    queryKey: reactionKeys.target(target),
    queryFn: () => listReactions(target),
  });
}

export function useChangeReaction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeReaction,
    onMutate: async ({ target, emoji, current }: ReactionChange) => {
      const key = reactionKeys.target(target);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Reaction[]>(key);
      const others = (previous ?? []).filter((reaction) => reaction.user_id !== userId);
      const removing = current?.emoji === emoji;
      const optimistic: Reaction = {
        id: current?.id ?? `pending-${Date.now()}`,
        couple_id: target.coupleId,
        user_id: userId,
        photo_id: target.kind === 'photo' ? target.id : null,
        note_id: target.kind === 'note' ? target.id : null,
        emoji,
        created_at: current?.created_at ?? new Date().toISOString(),
      };
      queryClient.setQueryData<Reaction[]>(key, removing ? others : [...others, optimistic]);
      return { previous };
    },
    onError: (_error, { target }, context) => {
      queryClient.setQueryData(reactionKeys.target(target), context?.previous);
    },
    onSettled: (_data, _error, { target }) => {
      queryClient.invalidateQueries({ queryKey: reactionKeys.target(target) });
    },
  });
}
