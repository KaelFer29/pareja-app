import { StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { ListOverview } from '@/features/lists/components/list-overview';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function ListsScreen() {
  const { couple } = useCouple();

  return (
    <Screen avoidKeyboard>
      <Text variant="title" style={styles.title}>
        Listas
      </Text>
      {couple && <ListOverview coupleId={couple.id} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
});
