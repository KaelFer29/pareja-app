import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ImagePlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import { formatRelative } from '@/shared/utils/date';

import { usePhotos } from '../hooks';

type LatestPhotoCardProps = {
  coupleId: string;
};

export function LatestPhotoCard({ coupleId }: LatestPhotoCardProps) {
  const photos = usePhotos(coupleId);
  const latest = photos.data?.pages[0]?.photos[0];

  if (!latest) {
    return (
      <Card onPress={() => router.push('/photos')} style={styles.emptyRow}>
        <View style={styles.emptyIcon}>
          <Icon icon={ImagePlus} size={24} color={colors.primary} />
        </View>
        <Text tone="muted" style={styles.flex}>
          {photos.isPending ? 'Cargando fotos.' : 'Aún no hay fotos. Sube la primera.'}
        </Text>
      </Card>
    );
  }

  return (
    <Card
      onPress={() => router.push({ pathname: '/photos/[id]', params: { id: latest.id } })}
      accessibilityLabel="Ver la última foto"
      style={styles.card}
    >
      <View style={styles.clip}>
        <Image
          source={latest.url ? { uri: latest.url, cacheKey: latest.storage_path } : null}
          style={[styles.image, { aspectRatio: latest.width / latest.height }]}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.footer}>
          {latest.caption && (
            <Text variant="bodyStrong" numberOfLines={2}>
              {latest.caption}
            </Text>
          )}
          <Text variant="caption" tone="muted">
            {formatRelative(latest.created_at)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  emptyIcon: {
    width: 52,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 0,
  },
  clip: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    maxHeight: 320,
    backgroundColor: colors.surfaceMuted,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - spacing.xs,
    gap: spacing.xxs,
  },
});
