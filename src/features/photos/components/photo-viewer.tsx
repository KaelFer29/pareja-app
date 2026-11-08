import { router } from 'expo-router';
import { Check, Pencil, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, shadows, spacing } from '@/shared/theme';
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

import { useDeletePhoto, useUpdatePhotoCaption } from '../hooks';
import type { Photo } from '../types';
import { ZoomablePhoto } from './zoomable-photo';

const FRAME = spacing.md - spacing.xxs;

type PhotoViewerProps = {
  photo: Photo;
  authorName: string;
  canDelete: boolean;
  footer?: React.ReactNode;
};

export function PhotoViewer({ photo, authorName, canDelete, footer }: PhotoViewerProps) {
  const deletePhoto = useDeletePhoto();
  const updateCaption = useUpdatePhotoCaption();
  const { width, height } = useWindowDimensions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(photo.caption ?? '');

  function startEditing() {
    setDraft(photo.caption ?? '');
    setEditing(true);
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
              <ZoomablePhoto
                uri={photo.url}
                cacheKey={photo.storage_path}
                width={imageWidth}
                height={imageHeight}
              />
              {!editing && <Text style={styles.caption}>{caption || fallbackDay}</Text>}
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.texts}>
              <Text variant="caption" tone="muted">
                Compartida por {authorName}
              </Text>
              <Text variant="caption" tone="muted">
                {formatChileDateTime(photo.created_at)}
              </Text>
              {edited && (
                <Text variant="caption" tone="muted">
                  Editada {formatChileDateTime(photo.updated_at)}
                </Text>
              )}
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
    borderRadius: 4,
    overflow: 'hidden',
    ...shadows.floating,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
