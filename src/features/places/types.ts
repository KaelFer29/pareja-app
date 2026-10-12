import type { Tables } from '@/shared/lib/database.types';

export type Place = Tables<'places'>;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PlaceDraft = Coordinates & {
  name: string;
  note: string;
  visitedOn: string | null;
};

export type NewPlaceInput = PlaceDraft & {
  coupleId: string;
};

export type PlaceChanges = PlaceDraft & {
  id: string;
};
