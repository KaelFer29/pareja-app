import {
  Accuracy,
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  requestForegroundPermissionsAsync,
  reverseGeocodeAsync,
} from 'expo-location';

import type { Coordinates } from './types';

export type CurrentLocation = { status: 'ok'; coordinates: Coordinates } | { status: 'denied' };

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const permission = await requestForegroundPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const position = await getCurrentPositionAsync({ accuracy: Accuracy.Balanced });
  return {
    status: 'ok',
    coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude },
  };
}

export async function getKnownLocation(): Promise<Coordinates | null> {
  const permission = await getForegroundPermissionsAsync();
  if (!permission.granted) return null;

  const position = await getLastKnownPositionAsync();
  if (!position) return null;
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

export async function suggestPlaceName(coordinates: Coordinates): Promise<string | null> {
  try {
    const [address] = await reverseGeocodeAsync(coordinates);
    if (!address) return null;
    const street = [address.street, address.streetNumber].filter(Boolean).join(' ');
    return address.name || street || address.district || address.city || null;
  } catch {
    return null;
  }
}
