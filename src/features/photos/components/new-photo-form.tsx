import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { LocalImage } from '@/shared/lib/image';
import { colors, radius, shadows, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
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
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.frame}>
        <Image
          source={{ uri: image.uri }}
          style={[styles.preview, { aspectRatio: image.width / image.height || 1 }]}
          contentFit="cover"
        />
      </View>
      <TextField
        label="Texto"
        placeholder="Cuéntale algo sobre esta foto (opcional)"
        maxLength={300}
        multiline
        value={caption}
        onChangeText={setCaption}
        style={styles.caption}
      />
      {uploadPhoto.isError && (
        <Notice message="No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo." />
      )}
      <Button title="Compartir" icon={Send} onPress={share} loading={uploadPhoto.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  frame: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  preview: {
    width: '100%',
    maxHeight: 420,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  caption: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
