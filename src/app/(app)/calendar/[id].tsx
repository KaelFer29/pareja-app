import { useLocalSearchParams } from 'expo-router';
import { CalendarX } from 'lucide-react-native';

import { EventForm } from '@/features/calendar/components/event-form';
import { useEvent } from '@/features/calendar/hooks';
import { useDismissNotificationsForPath } from '@/features/notifications/hooks';
import { EmptyState } from '@/shared/ui/empty-state';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useDismissNotificationsForPath(id ? `/calendar/${id}` : undefined);
  const event = useEvent(id);

  if (event.isPending) {
    return <LoadingState />;
  }

  if (event.isError) {
    return <ErrorState title="No se pudo cargar el plan" onRetry={() => event.refetch()} />;
  }

  if (!event.data) {
    return <EmptyState icon={CalendarX} title="Este plan ya no existe" />;
  }

  return (
    <FormKeyboardAvoiding>
      <EventForm key={event.data.updated_at} coupleId={event.data.couple_id} event={event.data} />
    </FormKeyboardAvoiding>
  );
}
