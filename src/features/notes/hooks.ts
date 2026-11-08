import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createNote,
  createNoteReply,
  deleteNote,
  deleteNoteReply,
  getNote,
  listNoteReplies,
  listNotes,
  reorderNotes,
  updateNote,
  updateNoteReply,
} from './api';
import type { Note } from './types';

export const noteKeys = {
  all: ['notes'] as const,
  list: (coupleId: string) => [...noteKeys.all, 'list', coupleId] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
  replies: (noteId: string) => [...noteKeys.all, 'replies', noteId] as const,
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

export function useReorderNotes(coupleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderNotes(coupleId, orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.list(coupleId) });
      const previous = queryClient.getQueryData<Note[]>(noteKeys.list(coupleId));
      if (previous) {
        const byId = new Map(previous.map((note) => [note.id, note]));
        const next = orderedIds
          .map((id, index) => {
            const note = byId.get(id);
            return note ? { ...note, position: index + 1 } : null;
          })
          .filter((note): note is Note => note !== null);
        queryClient.setQueryData(noteKeys.list(coupleId), next);
      }
      return { previous };
    },
    onError: (_error, _orderedIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(noteKeys.list(coupleId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(coupleId) });
    },
  });
}

export function useNoteReplies(noteId: string | undefined) {
  return useQuery({
    queryKey: noteKeys.replies(noteId ?? ''),
    queryFn: () => listNoteReplies(noteId ?? ''),
    enabled: !!noteId,
  });
}

export function useCreateNoteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNoteReply,
    onSuccess: (reply) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.replies(reply.note_id) });
    },
  });
}

export function useUpdateNoteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateNoteReply(id, content),
    onSuccess: (reply) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.replies(reply.note_id) });
    },
  });
}

export function useDeleteNoteReply(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNoteReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.replies(noteId) });
    },
  });
}
