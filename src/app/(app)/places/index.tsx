import { useCouple } from '@/features/couple/couple-provider';
import { PlacesView } from '@/features/places/components/places-view';
import { Screen } from '@/shared/ui/screen';

export default function PlacesScreen() {
  const { couple } = useCouple();

  return <Screen withTopInset={false}>{couple && <PlacesView coupleId={couple.id} />}</Screen>;
}
