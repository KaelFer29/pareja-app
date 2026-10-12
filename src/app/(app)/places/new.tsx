import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useCouple } from '@/features/couple/couple-provider';
import { PlaceForm } from '@/features/places/components/place-form';

export default function NewPlaceScreen() {
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const { couple } = useCouple();

  const initialCoordinates = useMemo(() => {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!lat || !lng || Number.isNaN(latitude) || Number.isNaN(longitude)) return undefined;
    return { latitude, longitude };
  }, [lat, lng]);

  if (!couple) return null;

  return <PlaceForm coupleId={couple.id} initialCoordinates={initialCoordinates} />;
}
