import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createNote, deleteNote, getNote, listNotes, updateNote } from './api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (coupleId: string) => [...noteKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
};

export function useNotes(coupleId: string) {
  return useQuery({
    queryKey: noteKeys.list(coupleId),
    queryFn: () => listNotes(coupleId),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNote(id),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.detail(note.id), note);
      queryClient.invalidateQueries({ queryKey: noteKeys.list(note.couple_id) });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNote,
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.detail(note.id), note);
      queryClient.invalidateQueries({ queryKey: noteKeys.list(note.couple_id) });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
