import { useLocalSearchParams } from 'expo-router';

import { EventForm } from '@/features/calendar/components/event-form';
import { useCouple } from '@/features/couple/couple-provider';

export default function NewEventScreen() {
  const { day } = useLocalSearchParams<{ day?: string }>();
  const { couple } = useCouple();

  if (!couple) return null;

  return <EventForm coupleId={couple.id} initialDay={day} />;
}
