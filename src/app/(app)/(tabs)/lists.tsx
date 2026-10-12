import { useCouple } from '@/features/couple/couple-provider';
import { ListOverview } from '@/features/lists/components/list-overview';
import { Screen } from '@/shared/ui/screen';

export default function ListsScreen() {
  const { couple } = useCouple();

  return (
    <Screen title="Listas" subtitle="Planes, deseos y pendientes" avoidKeyboard>
      {couple && <ListOverview coupleId={couple.id} />}
    </Screen>
  );
}
