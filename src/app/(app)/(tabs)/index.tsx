import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
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
import { Avatar } from '@/shared/ui/avatar';
import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const { couple, partner } = useCouple();
  const partnerName = partner?.profile?.display_name || 'tu pareja';

  if (!couple) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.partner}>
          <Avatar path={partner?.profile?.avatar_path} name={partnerName} size={56} />
          <View style={styles.partnerInfo}>
            <Text tone="muted">Estás con</Text>
            <Text variant="title" tone="primary">
              {partnerName}
            </Text>
            <MoodBadge mood={partner?.profile?.mood} />
          </View>
        </View>
        <DaysTogetherCard coupleId={couple.id} startedOn={couple.started_on} />
        <NudgeCard coupleId={couple.id} userId={userId} partnerName={partnerName} />
        <Card>
          <Text variant="caption" tone="muted">
            ¿Cómo te sientes?
          </Text>
          <MoodPicker userId={userId} mood={profile.data?.mood ?? null} />
        </Card>
        <NextDateCard coupleId={couple.id} />
        <LatestPhotoCard coupleId={couple.id} />
        <PinnedNotesCard coupleId={couple.id} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partnerInfo: {
    flex: 1,
  },
});
