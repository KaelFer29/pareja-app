import { StyleSheet, View } from 'react-native';

import { useSignOut } from '@/features/auth/hooks';
import { CoupleChoice } from '@/features/couple/components/couple-choice';
import { InviteCodeCard } from '@/features/couple/components/invite-code-card';
import { useCouple } from '@/features/couple/couple-provider';
import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function OnboardingScreen() {
  const { couple, error, refetch } = useCouple();
  const signOut = useSignOut();

  return (
    <Screen style={styles.container}>
      {error ? (
        <View style={styles.error}>
          <Text tone="danger" align="center">
            No se pudo cargar tu información. Revisa tu conexión e inténtalo de nuevo.
          </Text>
          <Button title="Reintentar" onPress={refetch} />
        </View>
      ) : couple ? (
        <InviteCodeCard code={couple.invite_code} />
      ) : (
        <CoupleChoice />
      )}
      <View style={styles.footer}>
        <Button
          title="Cerrar sesión"
          variant="secondary"
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  error: {
    gap: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
});
