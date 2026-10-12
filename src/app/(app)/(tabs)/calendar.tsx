import { useCouple } from '@/features/couple/couple-provider';
import { CalendarView } from '@/features/calendar/components/calendar-view';
import { useEvents } from '@/features/calendar/hooks';
import { useImportantDates } from '@/features/dates/hooks';
import { Screen } from '@/shared/ui/screen';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function CalendarScreen() {
  const { couple } = useCouple();
  const events = useEvents(couple?.id);
  const dates = useImportantDates(couple?.id);

  function refresh() {
    events.refetch();
    dates.refetch();
  }

  return (
    <Screen title="Calendario" subtitle="Sus planes juntos">
      {events.isPending ? (
        <LoadingState />
      ) : events.isError ? (
        <ErrorState title="No se pudo cargar el calendario" onRetry={refresh} />
      ) : (
        <CalendarView
          events={events.data}
          specials={dates.data ?? []}
          refreshing={events.isRefetching || dates.isRefetching}
          onRefresh={refresh}
        />
      )}
    </Screen>
  );
}
