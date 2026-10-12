import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { useSignOut } from '@/features/auth/hooks';
import { StartedOnField } from '@/features/couple/components/started-on-field';
import { useCouple } from '@/features/couple/couple-provider';
import { unregisterThisDevice } from '@/features/notifications/hooks';
import { AvatarPicker } from '@/features/profile/components/avatar-picker';
import { ProfileForm } from '@/features/profile/components/profile-form';
import { useProfile } from '@/features/profile/hooks';
import { spacing } from '@/shared/theme';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function SettingsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const { couple, partner } = useCouple();
  const signOut = useSignOut();
  const partnerName = partner?.profile?.display_name || 'Sin nombre';

  return (
    <Screen avoidKeyboard>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="title">Ajustes</Text>
        <Card>
          {profile.data && (
            <>
              <AvatarPicker profile={profile.data} />
              <ProfileForm key={profile.data.updated_at} profile={profile.data} />
            </>
          )}
          <Text variant="caption" tone="muted">
            {session?.user.email}
          </Text>
        </Card>
        <Card>
          <Text variant="caption" tone="muted">
            Tu pareja
          </Text>
          <View style={styles.partner}>
            <Avatar path={partner?.profile?.avatar_path} name={partnerName} />
            <Text variant="subtitle">{partnerName}</Text>
          </View>
          {couple && (
            <>
              <Text variant="caption" tone="muted">
                Juntos desde
              </Text>
              <StartedOnField coupleId={couple.id} startedOn={couple.started_on} />
            </>
          )}
        </Card>
        <Button
          title="Fechas importantes"
          variant="secondary"
          onPress={() => router.push('/dates')}
        />
        <Button
          title="Cerrar sesión"
          variant="secondary"
          onPress={() => unregisterThisDevice().finally(() => signOut.mutate())}
          loading={signOut.isPending}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
