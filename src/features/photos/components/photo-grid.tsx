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
  View,
} from 'react-native';

import { colors, fonts, spacing } from '@/shared/theme';
import { EmptyState } from '@/shared/ui/empty-state';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';
import { formatDayWithoutYear, formatMonthYear } from '@/shared/utils/date';
import { tiltFor } from '@/shared/utils/tilt';

import { usePhotos } from '../hooks';
import type { Photo } from '../types';

const COLUMNS = 2;
const GAP = spacing.md;
const FRAME = spacing.sm;

type AlbumItem =
  { kind: 'month'; key: string; label: string } | { kind: 'row'; key: string; photos: Photo[] };

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildAlbum(photos: Photo[]) {
  const items: AlbumItem[] = [];
  let currentMonth = '';
  let row: Photo[] = [];

  const flushRow = () => {
    if (row.length === 0) return;
    items.push({ kind: 'row', key: row[0].id, photos: row });
    row = [];
  };

  for (const photo of photos) {
    const date = new Date(photo.created_at);
    const key = monthKey(date);
    if (key !== currentMonth) {
      flushRow();
      currentMonth = key;
      items.push({ kind: 'month', key, label: formatMonthYear(date) });
    }
    row.push(photo);
    if (row.length === COLUMNS) flushRow();
  }
  flushRow();
  return items;
}

type PhotoGridProps = {
  coupleId: string;
};

export function PhotoGrid({ coupleId }: PhotoGridProps) {
  const photos = usePhotos(coupleId);
  const { width } = useWindowDimensions();
  const cardWidth = (width - SCREEN_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const items = buildAlbum(photos.data?.pages.flatMap((page) => page.photos) ?? []);

  if (photos.isPending) {
    return <LoadingState />;
  }

  if (photos.isError) {
    return <ErrorState title="No se pudieron cargar las fotos" onRetry={() => photos.refetch()} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) =>
        item.kind === 'month' ? (
          <View style={styles.month}>
            <Text style={styles.monthText}>{item.label}</Text>
            <View style={styles.monthLine} />
          </View>
        ) : (
          <View style={styles.row}>
            {item.photos.map((photo) => (
              <Polaroid key={photo.id} photo={photo} width={cardWidth} />
            ))}
          </View>
        )
      }
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

type PolaroidProps = {
  photo: Photo;
  width: number;
};

function Polaroid({ photo, width }: PolaroidProps) {
  const imageSize = width - FRAME * 2;
  const label = photo.caption || formatDayWithoutYear(new Date(photo.created_at));

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={photo.caption || 'Foto'}
      onPress={() => router.push({ pathname: '/photos/[id]', params: { id: photo.id } })}
      style={({ pressed }) => [
        styles.polaroid,
        { width, transform: [{ rotate: tiltFor(photo.id) }] },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
        style={[styles.image, { width: imageSize, height: imageSize }]}
        contentFit="cover"
        transition={150}
        recyclingKey={photo.id}
      />
      <Text style={styles.caption} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: GAP,
    paddingBottom: spacing.xl * 3,
  },
  month: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  monthText: {
    fontFamily: fonts.handBold,
    fontSize: 26,
    lineHeight: 30,
    color: colors.accent,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  polaroid: {
    padding: FRAME,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    borderRadius: 1,
    backgroundColor: colors.surfaceMuted,
  },
  caption: {
    fontFamily: fonts.hand,
    fontSize: 20,
    lineHeight: 30,
    color: colors.text,
    textAlign: 'center',
  },
});
