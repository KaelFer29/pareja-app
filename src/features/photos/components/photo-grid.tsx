import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { usePhotos } from '../hooks';
import type { Photo } from '../types';

const COLUMNS = 3;
const GAP = spacing.xs;

type PhotoGridProps = {
  coupleId: string;
};

export function PhotoGrid({ coupleId }: PhotoGridProps) {
  const photos = usePhotos(coupleId);
  const { width } = useWindowDimensions();
  const tileSize = (width - spacing.md * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const items = photos.data?.pages.flatMap((page) => page.photos) ?? [];

  if (photos.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (photos.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudieron cargar las fotos. Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <Button title="Reintentar" onPress={() => photos.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(photo) => photo.id}
      numColumns={COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <PhotoTile photo={item} size={tileSize} />}
      onEndReached={() => {
        if (photos.hasNextPage && !photos.isFetchingNextPage) photos.fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={photos.isRefetching && !photos.isFetchingNextPage}
          onRefresh={() => photos.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <Text tone="muted" align="center" style={styles.empty}>
          Aún no hay fotos. Sube la primera para que tu pareja la vea al instante.
        </Text>
      }
      ListFooterComponent={
        photos.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null
      }
    />
  );
}

type PhotoTileProps = {
  photo: Photo;
  size: number;
};

function PhotoTile({ photo, size }: PhotoTileProps) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/photos/[id]', params: { id: photo.id } })}>
      <Image
        source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
        style={[styles.tile, { width: size, height: size }]}
        contentFit="cover"
        transition={150}
        recyclingKey={photo.id}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  content: {
    gap: GAP,
    paddingBottom: spacing.xl * 3,
  },
  row: {
    gap: GAP,
  },
  tile: {
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  empty: {
    marginTop: spacing.xl,
  },
});
