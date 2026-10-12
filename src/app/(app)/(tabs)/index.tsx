import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { UpcomingPlans } from '@/features/calendar/components/upcoming-plans';
import { useEvents } from '@/features/calendar/hooks';
import { CoupleAvatars } from '@/features/couple/components/couple-avatars';
import { DaysTogetherCard } from '@/features/couple/components/days-together-card';
import { useCouple } from '@/features/couple/couple-provider';
import { useImportantDates } from '@/features/dates/hooks';
import { NudgeCard } from '@/features/nudges/components/nudge-card';
import { PetHome } from '@/features/pet/components/pet-home';
import { MoodBadge } from '@/features/profile/components/mood-badge';
import { MoodEmoji } from '@/features/profile/components/mood-emoji';
import { MoodSheet } from '@/features/profile/components/mood-sheet';
import { useProfile } from '@/features/profile/hooks';
import { colors, spacing } from '@/shared/theme';
import { Screen, ScreenHeader } from '@/shared/ui/screen';
import { SectionHeader } from '@/shared/ui/section-header';
import { formatWeekday } from '@/shared/utils/date';

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const { couple, partner } = useCouple();
  const events = useEvents(couple?.id);
  const dates = useImportantDates(couple?.id);
  const [moodOpen, setMoodOpen] = useState(false);
  const myName = profile.data?.display_name || 'Tú';
  const partnerName = partner?.profile?.display_name || 'Tu pareja';

  if (!couple) return null;

  const refreshing = events.isRefetching || dates.isRefetching;

  function refresh() {
    events.refetch();
    dates.refetch();
    profile.refetch();
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
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
                me={{
                  name: myName,
                  avatarPath: profile.data?.avatar_path,
                  badge: <MoodEmoji mood={profile.data?.mood} editable />,
                }}
                partner={{
                  name: partnerName,
                  avatarPath: partner?.profile?.avatar_path,
                  badge: <MoodEmoji mood={partner?.profile?.mood} />,
                }}
                onPressMe={() => setMoodOpen(true)}
                pressMeLabel="Elegir cómo te sientes"
              />
              <MoodBadge mood={partner?.profile?.mood} name={partnerName} />
            </View>
          }
        />

        <NudgeCard coupleId={couple.id} userId={userId} partnerName={partnerName} />

        <PetHome coupleId={couple.id} />

        <View style={styles.section}>
          <SectionHeader
            title="Próximos planes"
            actionLabel="Ver calendario"
            onAction={() => router.push('/calendar')}
          />
          <UpcomingPlans events={events.data ?? []} specials={dates.data ?? []} />
        </View>
      </ScrollView>

      <MoodSheet
        userId={userId}
        mood={profile.data?.mood ?? null}
        partnerName={partnerName}
        visible={moodOpen}
        onClose={() => setMoodOpen(false)}
      />
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
