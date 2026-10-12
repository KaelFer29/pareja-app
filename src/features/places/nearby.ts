import type { Coordinates, Place } from './types';

const EARTH_RADIUS_METERS = 6_371_000;
export const SAME_PLACE_METERS = 75;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function distanceInMeters(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function findSavedPlace(places: Place[], target: Coordinates) {
  let closest: { place: Place; distance: number } | null = null;
  for (const place of places) {
    const distance = distanceInMeters(place, target);
    if (distance <= SAME_PLACE_METERS && (!closest || distance < closest.distance)) {
      closest = { place, distance };
    }
  }
  return closest?.place ?? null;
}
