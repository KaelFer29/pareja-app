import { Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';
import { useEvents } from '@/features/calendar/hooks';
import { useEventsRealtime } from '@/features/calendar/realtime';
import { useCouple } from '@/features/couple/couple-provider';
import { useImportantDates } from '@/features/dates/hooks';
import { useImportantDatesRealtime } from '@/features/dates/realtime';
import { useNotesRealtime } from '@/features/notes/realtime';
import { useNotificationNavigation, usePushRegistration } from '@/features/notifications/hooks';
import { NudgeToast } from '@/features/nudges/components/nudge-toast';
import { usePetRealtime } from '@/features/pet/realtime';
import { useLatestPhoto } from '@/features/photos/hooks';
import { usePhotosRealtime } from '@/features/photos/realtime';
import { usePlacesRealtime } from '@/features/places/realtime';
import { useReactionsRealtime } from '@/features/reactions/realtime';
import { useWidgetsSync } from '@/features/widget/hooks';
import { colors, fonts } from '@/shared/theme';

export default function AppLayout() {
  const { session } = useAuth();
  const { couple, partner } = useCouple();
  usePhotosRealtime(couple?.id);
  useNotesRealtime(couple?.id);
  useImportantDatesRealtime(couple?.id);
  useEventsRealtime(couple?.id);
  useReactionsRealtime(couple?.id);
  usePlacesRealtime(couple?.id);
  usePetRealtime(couple?.id);
  usePushRegistration(session?.user.id);
  useNotificationNavigation();
  const latestPhoto = useLatestPhoto(couple?.id);
  const dates = useImportantDates(couple?.id);
  const events = useEvents(couple?.id);
  useWidgetsSync(
    [
      latestPhoto.data?.id,
      couple?.started_on,
      partner?.profile?.display_name,
      dates.dataUpdatedAt,
      events.dataUpdatedAt,
    ].join('|'),
  );

  return (
    <>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="photos/new" options={{ title: 'Nueva foto', presentation: 'modal' }} />
        <Stack.Screen name="photos/[id]" options={{ title: '' }} />
        <Stack.Screen name="notes/new" options={{ title: 'Nueva nota' }} />
        <Stack.Screen name="notes/[id]" options={{ title: 'Nota' }} />
        <Stack.Screen name="dates/index" options={{ title: 'Fechas importantes' }} />
        <Stack.Screen name="dates/new" options={{ title: 'Nueva fecha' }} />
        <Stack.Screen name="dates/[id]" options={{ title: 'Fecha' }} />
        <Stack.Screen name="calendar/new" options={{ title: 'Nuevo plan' }} />
        <Stack.Screen name="calendar/[id]" options={{ title: 'Plan' }} />
        <Stack.Screen name="places/index" options={{ title: 'Nuestros lugares' }} />
        <Stack.Screen name="places/new" options={{ title: 'Nuevo lugar' }} />
        <Stack.Screen name="places/[id]" options={{ title: 'Lugar' }} />
        <Stack.Screen name="pet" options={{ title: 'Mascota' }} />
      </Stack>
      <NudgeToast
        coupleId={couple?.id}
        userId={session?.user.id}
        senderName={partner?.profile?.display_name || 'Tu pareja'}
      />
    </>
  );
}
