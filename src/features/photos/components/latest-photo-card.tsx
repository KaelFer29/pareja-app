import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

import { usePhotos } from '../hooks';

type LatestPhotoCardProps = {
  coupleId: string;
};

export function LatestPhotoCard({ coupleId }: LatestPhotoCardProps) {
  const photos = usePhotos(coupleId);
  const latest = photos.data?.pages[0]?.photos[0];

  if (!latest) {
    return (
      <Pressable
        onPress={() => router.push('/photos')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card>
          <Text variant="caption" tone="muted">
            Última foto
          </Text>
          <Text tone="muted">
            {photos.isPending ? 'Cargando fotos.' : 'Aún no hay fotos. Sube la primera.'}
          </Text>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/photos/[id]', params: { id: latest.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <Text variant="caption" tone="muted">
          Última foto
        </Text>
        <Image
          source={latest.url ? { uri: latest.url, cacheKey: latest.storage_path } : null}
          style={[styles.image, { aspectRatio: latest.width / latest.height }]}
          contentFit="cover"
          transition={150}
        />
        {latest.caption && <Text numberOfLines={2}>{latest.caption}</Text>}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    maxHeight: 260,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
});
