import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { getCoupleErrorMessage } from '../errors';
import { useCreateCouple } from '../hooks';

export function CoupleChoice() {
  const createCouple = useCreateCouple();

  return (
    <View style={styles.container}>
      <Text variant="title" align="center">
        Vincula tu pareja
      </Text>
      <Text tone="muted" align="center">
        Una persona crea la pareja y comparte el código. La otra lo ingresa para unirse.
      </Text>
      <View style={styles.actions}>
        <Button
          title="Crear pareja"
          onPress={() => createCouple.mutate()}
          loading={createCouple.isPending}
        />
        <Button title="Tengo un código" variant="secondary" onPress={() => router.push('/join')} />
      </View>
      {createCouple.isError && (
        <Text variant="caption" tone="danger" align="center">
          {getCoupleErrorMessage(createCouple.error)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
