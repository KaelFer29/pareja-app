import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addItem,
  createList,
  deleteItem,
  deleteList,
  getList,
  listItems,
  listLists,
  renameList,
  toggleItem,
} from './api';
import type { ListItem } from './types';

export const listKeys = {
  all: ['lists'] as const,
  summaries: (coupleId: string) => [...listKeys.all, 'summaries', coupleId] as const,
  detail: (id: string) => [...listKeys.all, 'detail', id] as const,
  items: (listId: string) => [...listKeys.all, 'items', listId] as const,
};

export function useLists(coupleId: string) {
  return useQuery({
    queryKey: listKeys.summaries(coupleId),
    queryFn: () => listLists(coupleId),
  });
}

export function useList(id: string) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => getList(id),
  });
}

export function useListItems(listId: string) {
  return useQuery({
    queryKey: listKeys.items(listId),
    queryFn: () => listItems(listId),
  });
}

function useInvalidateLists() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: listKeys.all });
}

export function useCreateList() {
  const invalidate = useInvalidateLists();
  return useMutation({ mutationFn: createList, onSuccess: invalidate });
}

export function useRenameList() {
  const invalidate = useInvalidateLists();
  return useMutation({ mutationFn: renameList, onSettled: invalidate });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteList,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: listKeys.detail(id) });
      queryClient.removeQueries({ queryKey: listKeys.items(id) });
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

export function useAddItem() {
  const invalidate = useInvalidateLists();
  return useMutation({ mutationFn: addItem, onSuccess: invalidate });
}

export function useToggleItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleItem,
    onMutate: async ({ id, listId, done }) => {
      const key = listKeys.items(listId);
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<ListItem[]>(key, (items) =>
        items?.map((item) => (item.id === id ? { ...item, done } : item)),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKeys.all }),
  });
}

export function useDeleteItem() {
  const invalidate = useInvalidateLists();
  return useMutation({ mutationFn: deleteItem, onSuccess: invalidate });
}
