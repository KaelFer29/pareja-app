import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { CoupleAvatars } from '@/features/couple/components/couple-avatars';
import { DaysTogetherCard } from '@/features/couple/components/days-together-card';
import { useCouple } from '@/features/couple/couple-provider';
import { NextDateCard } from '@/features/dates/components/next-date-card';
import { PinnedNotesCard } from '@/features/notes/components/pinned-notes-card';
import { NudgeCard } from '@/features/nudges/components/nudge-card';
import { LatestPhotoCard } from '@/features/photos/components/latest-photo-card';
import { MoodBadge } from '@/features/profile/components/mood-badge';
import { MoodPicker } from '@/features/profile/components/mood-picker';
import { useProfile } from '@/features/profile/hooks';
import { spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Screen, ScreenHeader } from '@/shared/ui/screen';
import { SectionHeader } from '@/shared/ui/section-header';
import { formatWeekday } from '@/shared/utils/date';

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const { couple, partner } = useCouple();
  const myName = profile.data?.display_name || 'Tú';
  const partnerName = partner?.profile?.display_name || 'Tu pareja';

  if (!couple) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={profile.data?.display_name ? `Hola, ${profile.data.display_name}` : 'Hola'}
          subtitle={formatWeekday(new Date())}
        />
        <DaysTogetherCard
          coupleId={couple.id}
          startedOn={couple.started_on}
          header={
            <View style={styles.couple}>
              <CoupleAvatars
                me={{ name: myName, avatarPath: profile.data?.avatar_path }}
                partner={{ name: partnerName, avatarPath: partner?.profile?.avatar_path }}
              />
              <MoodBadge mood={partner?.profile?.mood} name={partnerName} />
            </View>
          }
        />

        <View style={styles.section}>
          <SectionHeader title={`Envía un toque a ${partnerName}`} />
          <NudgeCard coupleId={couple.id} userId={userId} partnerName={partnerName} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="¿Cómo te sientes?" />
          <Card>
            <MoodPicker userId={userId} mood={profile.data?.mood ?? null} />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Próxima fecha"
            actionLabel="Ver todas"
            onAction={() => router.push('/dates')}
          />
          <NextDateCard coupleId={couple.id} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Última foto"
            actionLabel="Ver todas"
            onAction={() => router.push('/photos')}
          />
          <LatestPhotoCard coupleId={couple.id} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Notas fijadas"
            actionLabel="Ver todas"
            onAction={() => router.push('/notes')}
          />
          <PinnedNotesCard coupleId={couple.id} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  couple: {
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  section: {
    gap: spacing.md - spacing.xs,
  },
});
