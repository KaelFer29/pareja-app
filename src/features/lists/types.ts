import type { Tables } from '@/shared/lib/database.types';

export type List = Tables<'lists'>;

export type ListItem = Tables<'list_items'>;

export type ListSummary = List & {
  total: number;
  done: number;
};

export type NewListInput = {
  coupleId: string;
  title: string;
};

export type RenameListInput = {
  id: string;
  title: string;
};

export type NewItemInput = {
  listId: string;
  coupleId: string;
  content: string;
};

export type ToggleItemInput = {
  id: string;
  listId: string;
  done: boolean;
};
