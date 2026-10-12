import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { DateList } from '@/features/dates/components/date-list';
import { spacing } from '@/shared/theme';
import { Fab } from '@/shared/ui/fab';

export default function DatesScreen() {
  const { couple } = useCouple();

  return (
    <View style={styles.container}>
      {couple && <DateList coupleId={couple.id} />}
      <Fab accessibilityLabel="Nueva fecha" onPress={() => router.push('/dates/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
});
