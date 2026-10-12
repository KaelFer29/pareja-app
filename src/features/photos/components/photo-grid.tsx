import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Images } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { EmptyState } from '@/shared/ui/empty-state';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { ErrorState, LoadingState } from '@/shared/ui/states';

import { usePhotos } from '../hooks';
import type { Photo } from '../types';

const COLUMNS = 3;
const GAP = spacing.xs + spacing.xxs;

type PhotoGridProps = {
  coupleId: string;
};

export function PhotoGrid({ coupleId }: PhotoGridProps) {
  const photos = usePhotos(coupleId);
  const { width } = useWindowDimensions();
  const tileSize = (width - SCREEN_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const items = photos.data?.pages.flatMap((page) => page.photos) ?? [];

  if (photos.isPending) {
    return <LoadingState />;
  }

  if (photos.isError) {
    return <ErrorState title="No se pudieron cargar las fotos" onRetry={() => photos.refetch()} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(photo) => photo.id}
      numColumns={COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
        <EmptyState
          icon={Images}
          title="Aún no hay fotos"
          description="Sube la primera con el botón + y tu pareja la verá al instante."
        />
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
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={photo.caption || 'Foto'}
      onPress={() => router.push({ pathname: '/photos/[id]', params: { id: photo.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
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
  content: {
    gap: GAP,
    paddingBottom: spacing.xl * 3,
  },
  row: {
    gap: GAP,
  },
  tile: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.8,
  },
});
