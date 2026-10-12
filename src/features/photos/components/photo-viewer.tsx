import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/shared/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { formatLongDate } from '@/shared/utils/date';

import { useDeletePhoto } from '../hooks';
import type { Photo } from '../types';

type PhotoViewerProps = {
  photo: Photo;
  authorName: string;
  canDelete: boolean;
  footer?: React.ReactNode;
};

export function PhotoViewer({ photo, authorName, canDelete, footer }: PhotoViewerProps) {
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.frame}>
        <Image
          source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
          style={styles.image}
          contentFit="contain"
          transition={150}
        />
      </View>
      <View style={styles.details}>
        <View style={styles.texts}>
          {photo.caption && <Text variant="bodyStrong">{photo.caption}</Text>}
          <Text variant="caption" tone="muted">
            Compartida por {authorName} el {formatLongDate(photo.created_at)}
          </Text>
        </View>
        {canDelete &&
          (deletePhoto.isPending ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <IconButton
              icon={Trash2}
              tone="danger"
              accessibilityLabel="Eliminar foto"
              onPress={confirmDelete}
            />
          ))}
      </View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  frame: {
    flex: 1,
    marginHorizontal: SCREEN_PADDING,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: spacing.md,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing.md,
  },
});
