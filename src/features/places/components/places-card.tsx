import { router } from 'expo-router';
import { MapPinned } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { usePlaces } from '../hooks';

type PlacesCardProps = {
  coupleId: string;
};

export function PlacesCard({ coupleId }: PlacesCardProps) {
  const places = usePlaces(coupleId);
  const count = places.data?.length ?? 0;
  const latest = places.data?.[0];

  return (
    <Card onPress={() => router.push('/places')} style={styles.card}>
      <View style={styles.icon}>
        <Icon icon={MapPinned} size={24} color={colors.primary} />
      </View>
      <View style={styles.texts}>
        <Text variant="bodyStrong">Nuestro mapa</Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {count === 0
            ? 'Marquen los lugares que visitan juntos.'
            : `${count === 1 ? '1 lugar' : `${count} lugares`} · El último: ${latest?.name}`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  icon: {
    width: 52,
    height: 52,
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
