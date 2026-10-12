import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { NewPhotoForm } from '@/features/photos/components/new-photo-form';
import { getPendingPhoto } from '@/features/photos/pending-photo';
import { spacing } from '@/shared/theme';
import { SCREEN_PADDING } from '@/shared/ui/screen';

export default function NewPhotoScreen() {
  const [image] = useState(getPendingPhoto);
  const { couple } = useCouple();

  if (!image) return <Redirect href="/photos" />;
  if (!couple) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <NewPhotoForm coupleId={couple.id} image={image} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
});
