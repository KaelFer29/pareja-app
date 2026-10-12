import { StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { AddPhotoButton } from '@/features/photos/components/add-photo-button';
import { PhotoGrid } from '@/features/photos/components/photo-grid';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function PhotosScreen() {
  const { couple } = useCouple();

  return (
    <Screen>
      <Text variant="title" style={styles.title}>
        Fotos
      </Text>
      {couple && <PhotoGrid coupleId={couple.id} />}
      <AddPhotoButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
});
