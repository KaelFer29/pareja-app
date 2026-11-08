import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { NewPhotoForm } from '@/features/photos/components/new-photo-form';
import { getPendingPhoto } from '@/features/photos/pending-photo';
import { spacing } from '@/shared/theme';
import { FormKeyboardAvoiding } from '@/shared/ui/form-keyboard-avoiding';
import { SCREEN_PADDING } from '@/shared/ui/screen';

export default function NewPhotoScreen() {
  const [image] = useState(getPendingPhoto);
  const { couple } = useCouple();

  if (!image) return <Redirect href="/photos" />;
  if (!couple) return null;

  return (
    <FormKeyboardAvoiding style={styles.container}>
      <NewPhotoForm coupleId={couple.id} image={image} />
    </FormKeyboardAvoiding>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.md,
  },
});
