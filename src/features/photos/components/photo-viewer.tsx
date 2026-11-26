import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Check, Download, Pencil, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '@/shared/theme';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';
import { IconButton } from '@/shared/ui/icon-button';
import { Notice } from '@/shared/ui/notice';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import {
  formatChileDateTime,
  formatDayWithoutYear,
  wasEditedAfterCreate,
} from '@/shared/utils/date';
import { withGlyphRoom } from '@/shared/utils/handwriting';

import { useDeletePhoto, useUpdatePhotoCaption } from '../hooks';
import { savePhotoToGallery } from '../save-to-gallery';
import type { Photo } from '../types';
import { PhotoLightbox } from './photo-lightbox';

const FRAME = spacing.md - spacing.xxs;

type PhotoViewerProps = {
  photo: Photo;
  authorName: string;
  footer?: React.ReactNode;
};

export function PhotoViewer({ photo, authorName, footer }: PhotoViewerProps) {
  const deletePhoto = useDeletePhoto();
  const updateCaption = useUpdatePhotoCaption();
  const { width, height } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(photo.caption ?? '');
  const [savingGallery, setSavingGallery] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  function startEditing() {
    setDraft(photo.caption ?? '');
    setEditing(true);
  }

  async function downloadPhoto() {
    if (!photo.url) {
      Alert.alert('No se pudo descargar la foto', 'Espera un momento e inténtalo de nuevo.');
      return;
    }
    setSavingGallery(true);
    try {
      await savePhotoToGallery(photo.url);
      Alert.alert('Foto guardada', 'La foto quedó en la galería de tu teléfono.');
    } catch (error) {
      const denied = error instanceof Error && error.message === 'permission_denied';
      Alert.alert(
        'No se pudo descargar la foto',
        denied
          ? 'Activa el permiso de galería en Ajustes e inténtalo de nuevo.'
          : 'Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setSavingGallery(false);
    }
  }

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

  function saveCaption() {
    updateCaption.mutate(
      { id: photo.id, caption: draft },
      {
        onSuccess: () => setEditing(false),
        onError: () =>
          Alert.alert(
            'No se pudo guardar la descripción',
            'Revisa tu conexión e inténtalo de nuevo.',
          ),
      },
    );
  }

  const ratio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 1;
  let imageWidth = width - SCREEN_PADDING * 2 - FRAME * 2;
  let imageHeight = imageWidth / ratio;
  const maxHeight = height * 0.48;
  if (imageHeight > maxHeight) {
    imageHeight = maxHeight;
    imageWidth = maxHeight * ratio;
  }

  const caption = photo.caption?.trim() || '';
  const fallbackDay = formatDayWithoutYear(new Date(photo.created_at));
  const edited = wasEditedAfterCreate(photo.created_at, photo.updated_at);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FormKeyboardAvoiding>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stage}>
            <View style={styles.polaroid}>
              <Pressable
                accessibilityRole="imagebutton"
                accessibilityLabel="Ver foto en pantalla completa"
                onPress={() => setFullscreen(true)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Image
                  source={photo.url ? { uri: photo.url, cacheKey: photo.storage_path } : null}
                  style={[styles.image, { width: imageWidth, height: imageHeight }]}
                  contentFit="cover"
                  transition={150}
                />
              </Pressable>
              {!editing && (
                <Text style={[styles.caption, { maxWidth: imageWidth }]}>
                  {withGlyphRoom(caption || fallbackDay)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.meta}>
            <Text variant="caption" tone="muted">
              Compartida por {authorName}
            </Text>
            <Text variant="caption" tone="muted">
              {formatChileDateTime(photo.created_at)}
              {edited ? ' · editada' : ''}
            </Text>
          </View>

          <View style={styles.actions}>
            {editing ? (
              <>
                <IconButton
                  icon={X}
                  accessibilityLabel="Cancelar edición"
                  onPress={() => {
                    setDraft(photo.caption ?? '');
                    setEditing(false);
                  }}
                />
                {updateCaption.isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <IconButton
                    icon={Check}
                    tone="primary"
                    accessibilityLabel="Guardar descripción"
                    onPress={saveCaption}
                  />
                )}
              </>
            ) : (
              <IconButton
                icon={Pencil}
                tone="primary"
                accessibilityLabel="Editar descripción"
                onPress={startEditing}
              />
            )}
            {savingGallery ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <IconButton
                icon={Download}
                tone="primary"
                accessibilityLabel="Descargar foto"
                onPress={downloadPhoto}
              />
            )}
            {deletePhoto.isPending ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <IconButton
                icon={Trash2}
                tone="danger"
                accessibilityLabel="Eliminar foto"
                onPress={confirmDelete}
              />
            )}
          </View>

          {editing && (
            <View style={styles.editor}>
              <TextField
                label="Descripción"
                placeholder="Cuéntale algo sobre esta foto (opcional)"
                maxLength={300}
                multiline
                value={draft}
                onChangeText={setDraft}
                style={styles.captionField}
                autoFocus
              />
              {updateCaption.isError && (
                <Notice message="No se pudo guardar la descripción. Revisa tu conexión e inténtalo de nuevo." />
              )}
            </View>
          )}

          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </FormKeyboardAvoiding>
      <PhotoLightbox
        uri={photo.url}
        cacheKey={photo.storage_path}
        visible={fullscreen}
        onClose={() => setFullscreen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
  polaroid: {
    alignItems: 'center',
    padding: FRAME,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.paper,
    ...shadows.floating,
  },
  image: {
    borderRadius: radius.hairline,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  caption: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    ...typography.handCaptionLarge,
    color: colors.text,
    textAlign: 'center',
  },
  meta: {
    gap: spacing.xxs,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  editor: {
    paddingHorizontal: SCREEN_PADDING,
    gap: spacing.sm,
  },
  captionField: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
});
