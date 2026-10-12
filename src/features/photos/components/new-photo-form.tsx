import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import type { LocalImage } from '@/shared/lib/image';
import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useUploadPhoto } from '../hooks';

type NewPhotoFormProps = {
  coupleId: string;
  image: LocalImage;
};

export function NewPhotoForm({ coupleId, image }: NewPhotoFormProps) {
  const [caption, setCaption] = useState('');
  const uploadPhoto = useUploadPhoto();

  function share() {
    uploadPhoto.mutate({ coupleId, image, caption }, { onSuccess: () => router.back() });
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Image
        source={{ uri: image.uri }}
        style={[styles.preview, { aspectRatio: image.width / image.height || 1 }]}
        contentFit="contain"
      />
      <TextField
        placeholder="Agrega un texto (opcional)"
        maxLength={300}
        multiline
        value={caption}
        onChangeText={setCaption}
      />
      {uploadPhoto.isError && (
        <Text variant="caption" tone="danger">
          No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
      <Button title="Compartir" onPress={share} loading={uploadPhoto.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  preview: {
    width: '100%',
    maxHeight: 420,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
});
