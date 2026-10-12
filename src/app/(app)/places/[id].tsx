import { useLocalSearchParams } from 'expo-router';
import { MapPinOff } from 'lucide-react-native';

import { PlaceForm } from '@/features/places/components/place-form';
import { usePlace } from '@/features/places/hooks';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = usePlace(id);

  if (place.isPending) {
    return <LoadingState />;
  }

  if (place.isError) {
    return <ErrorState title="No se pudo cargar el lugar" onRetry={() => place.refetch()} />;
  }

  if (!place.data) {
    return <EmptyState icon={MapPinOff} title="Este lugar ya no existe" />;
  }

  return <PlaceForm key={place.data.id} coupleId={place.data.couple_id} place={place.data} />;
}
