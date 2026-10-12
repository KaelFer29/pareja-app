import { router } from 'expo-router';
import { CalendarHeart, LogOut, MapPinned, PawPrint } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { useSignOut } from '@/features/auth/hooks';
import { StartedOnField } from '@/features/couple/components/started-on-field';
import { useCouple } from '@/features/couple/couple-provider';
import { unregisterThisDevice } from '@/features/notifications/hooks';
import { AvatarPicker } from '@/features/profile/components/avatar-picker';
import { ProfileForm } from '@/features/profile/components/profile-form';
import { useProfile } from '@/features/profile/hooks';
import { colors, spacing } from '@/shared/theme';
import { ViewableAvatar } from '@/shared/ui/avatar-viewer';
import { Card } from '@/shared/ui/card';
import { ListRow } from '@/shared/ui/list-row';
import { Screen } from '@/shared/ui/screen';
import { SectionHeader } from '@/shared/ui/section-header';
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" accessibilityRole="header" style={styles.title}>
          Ajustes
        </Text>

        <Card style={styles.profile}>
          {profile.data && (
            <>
              <AvatarPicker profile={profile.data} />
              <Text variant="caption" tone="muted" align="center">
                {session?.user.email}
              </Text>
              <View style={styles.stretch}>
                <ProfileForm key={profile.data.updated_at} profile={profile.data} />
              </View>
            </>
          )}
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Tu pareja" />
          <Card style={styles.partnerCard}>
            <View style={styles.partner}>
              <ViewableAvatar
                path={partner?.profile?.avatar_path}
                name={partnerName}
                size={52}
                ringColor={colors.primarySoft}
              />
              <View style={styles.flex}>
                <Text variant="heading">{partnerName}</Text>
                <Text variant="caption" tone="muted">
                  Vinculados en Pareja
                </Text>
              </View>
            </View>
            {couple && (
              <StartedOnField
                coupleId={couple.id}
                startedOn={couple.started_on}
                label="Juntos desde"
              />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="General" />
          <Card style={styles.menu}>
            <ListRow
              icon={CalendarHeart}
              title="Fechas importantes"
              description="Aniversarios, cumpleaños y más"
              onPress={() => router.push('/dates')}
            />
            <ListRow
              icon={MapPinned}
              title="Nuestros lugares"
              description="El mapa de lo que han visitado"
              onPress={() => router.push('/places')}
            />
            <ListRow
              icon={PawPrint}
              title="Mascota"
              description="Cuídenla entre los dos"
              onPress={() => router.push('/pet')}
            />
          </Card>
        </View>

        <Card style={styles.menu}>
          <ListRow
            icon={LogOut}
            title="Cerrar sesión"
            description={signOut.isPending ? 'Cerrando sesión' : undefined}
            tone="danger"
            showChevron={false}
            onPress={() => {
              if (signOut.isPending) return;
              unregisterThisDevice().finally(() => signOut.mutate());
            }}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    paddingTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  flex: {
    flex: 1,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  profile: {
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    paddingVertical: spacing.lg,
  },
  section: {
    gap: spacing.md - spacing.xs,
  },
  partnerCard: {
    gap: spacing.md,
  },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  menu: {
    paddingVertical: spacing.sm,
  },
});
