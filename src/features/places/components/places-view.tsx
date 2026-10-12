import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Fab } from '@/shared/ui/fab';
import { Icon } from '@/shared/ui/icon';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatDay } from '@/shared/utils/date';

import { usePlaces } from '../hooks';
import type { Coordinates, Place } from '../types';
import { PlaceMap } from './place-map';

type PlacesViewProps = {
  coupleId: string;
};

function openPlace(id: string) {
  router.push({ pathname: '/places/[id]', params: { id } });
}

function addPlace(coordinates?: Coordinates) {
  router.push({
    pathname: '/places/new',
    params: coordinates
      ? { lat: String(coordinates.latitude), lng: String(coordinates.longitude) }
      : {},
  });
}

export function PlacesView({ coupleId }: PlacesViewProps) {
  const places = usePlaces(coupleId);

  if (places.isPending) {
    return <LoadingState />;
  }

  if (places.isError) {
    return (
      <ErrorState title="No se pudieron cargar los lugares" onRetry={() => places.refetch()} />
    );
  }

  const count = places.data.length;

  return (
    <>
      <View style={styles.header}>
        <PlaceMap
          key={places.data.map((place) => place.id).join()}
          points={places.data}
          onPressPoint={openPlace}
          onLongPress={addPlace}
          style={styles.map}
        />
        <Text variant="caption" tone="muted" align="center">
          {count === 0
            ? 'Mantén presionado el mapa para marcar su primer lugar.'
            : `${count === 1 ? '1 lugar' : `${count} lugares`} juntos. Mantén presionado el mapa para sumar otro.`}
        </Text>
      </View>
      <FlatList
        data={places.data}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PlaceRow place={item} />}
        ListEmptyComponent={
          <EmptyState
            icon={MapPin}
            title="Aún no hay lugares"
            description="Guarden los lugares que visitan juntos y los recuerdos de cada uno."
          />
        }
      />
      <Fab accessibilityLabel="Marcar lugar" onPress={() => addPlace()} />
    </>
  );
}

function PlaceRow({ place }: { place: Place }) {
  const subtitle = place.visited_on ? formatDay(place.visited_on) : place.note || null;

  return (
    <Card onPress={() => openPlace(place.id)} style={styles.row} accessibilityLabel={place.name}>
      <View style={styles.icon}>
        <Icon icon={MapPin} size={20} color={colors.primary} />
      </View>
      <View style={styles.texts}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {place.name}
        </Text>
        {subtitle && (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: spacing.sm + spacing.xxs,
    paddingBottom: spacing.xl * 3,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  map: {
    height: 300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
