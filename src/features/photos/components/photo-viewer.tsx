import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Alert, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, shadows, spacing } from '@/shared/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { formatDayWithoutYear, formatLongDate } from '@/shared/utils/date';

import { useDeletePhoto } from '../hooks';
import type { Photo } from '../types';

const FRAME = spacing.md - spacing.xxs;

type PhotoViewerProps = {
  photo: Photo;
  authorName: string;
  canDelete: boolean;
  footer?: React.ReactNode;
};

export function PhotoViewer({ photo, authorName, canDelete, footer }: PhotoViewerProps) {
  const deletePhoto = useDeletePhoto();
  const { width, height } = useWindowDimensions();

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

  const ratio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 1;
  let imageWidth = width - SCREEN_PADDING * 2 - FRAME * 2;
  let imageHeight = imageWidth / ratio;
  const maxHeight = height * 0.52;
  if (imageHeight > maxHeight) {
    imageHeight = maxHeight;
    imageWidth = maxHeight * ratio;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.stage}>
        <View style={styles.polaroid}>
          <Image
            source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            contentFit="cover"
            transition={150}
          />
          <Text style={styles.caption} numberOfLines={2}>
            {photo.caption || formatDayWithoutYear(new Date(photo.created_at))}
          </Text>
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.texts}>
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
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
  },
  polaroid: {
    alignItems: 'center',
    padding: FRAME,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 4,
    transform: [{ rotate: '-1deg' }],
    ...shadows.floating,
  },
  image: {
    borderRadius: 2,
    backgroundColor: colors.surfaceMuted,
  },
  caption: {
    marginTop: spacing.sm,
    maxWidth: '100%',
    fontFamily: fonts.hand,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'center',
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
