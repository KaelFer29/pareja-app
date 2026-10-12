import type { Coordinates } from './types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Pareja/1.0 (com.kaelfernandez.pareja)';
const NEARBY_DEGREES = 1.5;

export type AddressResult = Coordinates & {
  id: string;
  name: string;
  address: string;
};

type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
};

export async function searchAddress(
  query: string,
  near?: Coordinates | null,
): Promise<AddressResult[]> {
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: '6',
    'accept-language': 'es',
  });
  if (near) {
    params.set(
      'viewbox',
      [
        near.longitude - NEARBY_DEGREES,
        near.latitude + NEARBY_DEGREES,
        near.longitude + NEARBY_DEGREES,
        near.latitude - NEARBY_DEGREES,
      ].join(','),
    );
  }

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`search_failed_${response.status}`);

  const places = (await response.json()) as NominatimPlace[];
  return places.map((place) => {
    const [first, ...rest] = place.display_name.split(', ');
    return {
      id: String(place.place_id),
      name: place.name || first,
      address: (place.name ? place.display_name : rest.join(', ')) || place.display_name,
      latitude: Number(place.lat),
      longitude: Number(place.lon),
    };
  });
}
