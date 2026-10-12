import { LogOut, WifiOff } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSignOut } from '@/features/auth/hooks';
import { CoupleChoice } from '@/features/couple/components/couple-choice';
import { InviteCodeCard } from '@/features/couple/components/invite-code-card';
import { useCouple } from '@/features/couple/couple-provider';
import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';

export default function OnboardingScreen() {
  const { couple, error, refetch } = useCouple();
  const signOut = useSignOut();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <EmptyState
            icon={WifiOff}
            title="No se pudo cargar tu información"
            description="Revisa tu conexión e inténtalo de nuevo."
            action={<Button title="Reintentar" onPress={refetch} />}
          />
        ) : couple ? (
          <InviteCodeCard code={couple.invite_code} />
        ) : (
          <CoupleChoice />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Cerrar sesión"
          variant="ghost"
          icon={LogOut}
          onPress={() => signOut.mutate()}
          loading={signOut.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingBottom: spacing.md,
  },
});
