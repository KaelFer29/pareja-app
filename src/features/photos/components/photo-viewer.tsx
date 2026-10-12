import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { formatLongDate } from '@/shared/utils/date';

import { useDeletePhoto } from '../hooks';
import type { Photo } from '../types';

type PhotoViewerProps = {
  photo: Photo;
  authorName: string;
  canDelete: boolean;
};

export function PhotoViewer({ photo, authorName, canDelete }: PhotoViewerProps) {
  const deletePhoto = useDeletePhoto();

  function confirmDelete() {
    Alert.alert('Eliminar foto', 'La foto se eliminará para los dos. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deletePhoto.mutate(photo, {
            onSuccess: () => router.back(),
            onError: () =>
              Alert.alert(
                'No se pudo eliminar la foto',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Image
        source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
        style={styles.image}
        contentFit="contain"
        transition={150}
      />
      <View style={styles.details}>
        {photo.caption && <Text>{photo.caption}</Text>}
        <Text variant="caption" tone="muted">
          {authorName} - {formatLongDate(photo.created_at)}
        </Text>
        {canDelete && (
          <Button
            title="Eliminar"
            variant="secondary"
            onPress={confirmDelete}
            loading={deletePhoto.isPending}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  details: {
    gap: spacing.sm,
    padding: spacing.md,
  },
});
